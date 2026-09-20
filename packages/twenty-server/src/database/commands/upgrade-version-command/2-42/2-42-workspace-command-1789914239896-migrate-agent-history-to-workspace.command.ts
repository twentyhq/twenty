import { Command } from 'nest-commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IsNull, MoreThan, Not } from 'typeorm';

import { AgentHistoryMigrationService } from 'src/database/commands/agent-history/agent-history-migration.service';
import { AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AGENT_HISTORY_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-names.constant';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { type AgentHistoryStorageState } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-storage-state.type';
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
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threads: AgentHistoryRepository<AgentChatThreadEntity>,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
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
      await this.recoverInterruptedStreams(workspaceId);
    }
    await this.migration.migrate({ workspaceId, target });
  }

  private async recoverInterruptedStreams(workspaceId: string): Promise<void> {
    let lastId: string | undefined;
    while (true) {
      const threads = await this.threads.find(workspaceId, {
        where: {
          activeStreamId: Not(IsNull()),
          ...(isDefined(lastId) ? { id: MoreThan(lastId) } : {}),
        },
        order: { id: 'ASC' },
        take: 100,
      });
      if (!isNonEmptyArray(threads)) {
        return;
      }
      for (const thread of threads) {
        await this.streamRecoveryService.reapDeadStream({
          thread,
          workspaceId,
        });
      }
      lastId = threads[threads.length - 1].id;
    }
  }
}
