import { Command } from 'nest-commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { AgentHistoryMigrationService } from 'src/database/commands/agent-history/agent-history-migration.service';
import { AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { getAgentHistoryTable } from 'src/database/commands/agent-history/utils/get-agent-history-table.util';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { type AgentChatThreadLastStreamError } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-last-stream-error.type';
import { AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { type AgentHistoryStorageState } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.42.0', 1789914239896)
@Command({
  name: 'upgrade:2-42:migrate-agent-history-to-workspace',
  description:
    'Provision agent history objects, recover interrupted streams, copy and verify history, then switch workspace storage',
})
export class MigrateAgentHistoryToWorkspaceCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly schema: AgentHistorySchemaService,
    private readonly migration: AgentHistoryMigrationService,
    private readonly storage: AgentHistoryStorageService,
    private readonly streamHeartbeatService: AgentChatStreamHeartbeatService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly metricsService: MetricsService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.migrateTo({ ...args, target: 'workspace' });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.migrateTo({ ...args, target: 'core' });
  }

  private async migrateTo({
    workspaceId,
    options,
    dataSource,
    target,
  }: RunOnWorkspaceArgs & {
    target: AgentHistoryStorageState['storage'];
  }): Promise<void> {
    const dryRun = options.dryRun ?? false;
    if (!isDefined(dataSource)) {
      throw new Error('Agent history upgrade requires a workspace data source');
    }
    const runner = dataSource.createQueryRunner('master');
    let state: AgentHistoryStorageState;
    try {
      await runner.connect();
      state = await this.storage.readState(runner, workspaceId);
      if (!(await runner.hasSchema(getWorkspaceSchemaName(workspaceId)))) {
        const history = await runner.query(
          `SELECT 1 WHERE ${AGENT_HISTORY_OBJECT_NAMES.map(
            (name) =>
              `EXISTS (SELECT 1 FROM core."${name}" WHERE "workspaceId" = $1)`,
          ).join(' OR ')}`,
          [workspaceId],
        );
        if (
          isNonEmptyArray(history) ||
          state.storage === 'workspace' ||
          isDefined(state.migration)
        ) {
          throw new Error(
            `Workspace schema is missing for ${workspaceId} with existing agent history or migration state`,
          );
        }
        // Older installations can retain empty workspace records without a
        // physical schema. Normal provisioning will initialize their route.
        this.logger.log(
          `Skipping agent history upgrade for workspace ${workspaceId}: schema is absent and history is empty`,
        );
        return;
      }
    } finally {
      await runner.release();
    }
    await this.schema.prepare(workspaceId, dryRun);
    if (dryRun) {
      await this.migration.inspect(workspaceId);
      return;
    }
    // An interrupted copy already fences repository access; resume its durable
    // cursor without trying to reap streams through the fenced repository.
    if (!isDefined(state.migration) && state.storage !== target) {
      await this.recoverInterruptedStreams({
        dataSource,
        workspaceId,
        source: state.storage,
      });
    }
    await this.migration.migrate({ workspaceId, target });
  }

  // Reads the source store directly: the runtime repository only serves
  // workspace storage, and this runs before history has moved there.
  private async recoverInterruptedStreams({
    dataSource,
    workspaceId,
    source,
  }: {
    dataSource: NonNullable<RunOnWorkspaceArgs['dataSource']>;
    workspaceId: string;
    source: AgentHistoryStorageState['storage'];
  }): Promise<void> {
    const runner = dataSource.createQueryRunner('master');
    try {
      await runner.connect();
      let lastId: string | null = null;
      while (true) {
        const threads: { id: string; activeStreamId: string }[] =
          await runner.query(
            `SELECT id, "activeStreamId" FROM ${this.threadTable({ workspaceId, source })}
             WHERE "activeStreamId" IS NOT NULL AND ($1::uuid IS NULL OR id > $1::uuid)
             ${source === 'core' ? 'AND "workspaceId" = $2' : ''}
             ORDER BY id ASC LIMIT 100`,
            source === 'core' ? [lastId, workspaceId] : [lastId],
          );
        if (!isNonEmptyArray(threads)) {
          return;
        }
        for (const thread of threads) {
          await this.reapDeadStream({ runner, workspaceId, source, thread });
        }
        lastId = threads[threads.length - 1].id;
      }
    } finally {
      await runner.release();
    }
  }

  private async reapDeadStream({
    runner,
    workspaceId,
    source,
    thread,
  }: {
    runner: QueryRunner;
    workspaceId: string;
    source: AgentHistoryStorageState['storage'];
    thread: { id: string; activeStreamId: string };
  }): Promise<void> {
    if (await this.streamHeartbeatService.isAlive(thread.activeStreamId)) {
      return;
    }

    const interruptedError: AgentChatThreadLastStreamError = {
      code: AiExceptionCode.STREAM_INTERRUPTED,
      message: 'The response was interrupted before it could finish.',
      failedAt: new Date().toISOString(),
    };

    const reaped: { id: string }[] = await runner.query(
      `WITH reaped AS (
         UPDATE ${this.threadTable({ workspaceId, source })}
         SET "activeStreamId" = NULL, "lastStreamError" = $3::jsonb, "updatedAt" = now()
         WHERE id = $1 AND "activeStreamId" = $2
         ${source === 'core' ? 'AND "workspaceId" = $4' : ''}
         RETURNING id
       ) SELECT id FROM reaped`,
      [
        thread.id,
        thread.activeStreamId,
        JSON.stringify(interruptedError),
        ...(source === 'core' ? [workspaceId] : []),
      ],
    );

    if (!isNonEmptyArray(reaped)) {
      return;
    }

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AiChatTurnFailed,
      amount: 1,
      attributes: {
        failure_phase: 'interrupted',
        error_code: interruptedError.code,
      },
    });

    await this.eventPublisherService.resetStreamState(thread.id);
    await this.eventPublisherService
      .publish({
        threadId: thread.id,
        workspaceId,
        event: {
          type: 'stream-error',
          code: interruptedError.code,
          message: interruptedError.message,
        },
      })
      .catch(() => {});
  }

  private threadTable({
    workspaceId,
    source,
  }: {
    workspaceId: string;
    source: AgentHistoryStorageState['storage'];
  }): string {
    return getAgentHistoryTable({
      workspaceId,
      storage: source,
      name: 'agentChatThread',
    });
  }
}
