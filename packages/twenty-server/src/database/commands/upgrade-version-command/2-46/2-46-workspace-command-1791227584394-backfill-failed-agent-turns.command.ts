import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// A failed stream is a failed turn: the error a thread held moves to its latest
// turn, which retries and the chat banner now read. The thread column stays
// until the 2.42 history move that still copies it is gone, and nothing clears
// it, so a thread that had a turn after the error, before this ran or before
// a rerun, keeps that turn as it is.
@RegisteredWorkspaceCommand('2.46.0', 1791227584394)
@Command({
  name: 'upgrade:2-46:backfill-failed-agent-turns',
  description:
    'Mark the latest turn of chat threads holding a stream error as failed, with that error',
})
export class BackfillFailedAgentTurnsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly storage: AgentHistoryUpgradeStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const hasRequiredFields = [
      STANDARD_OBJECTS.agentChatThread.fields.lastStreamError
        .universalIdentifier,
      STANDARD_OBJECTS.agentTurn.fields.status.universalIdentifier,
      STANDARD_OBJECTS.agentTurn.fields.error.universalIdentifier,
    ].every((universalIdentifier) =>
      isDefined(
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        }),
      ),
    );

    if (!hasRequiredFields) {
      this.logger.log(
        `Chat history fields not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would mark the latest turn of threads with a stream error as failed for workspace ${workspaceId}`,
      );

      return;
    }

    const failedTurnCount = await this.storage.run(
      workspaceId,
      async ({ manager, table }) => {
        const failedTurns: { id: string }[] = await manager.query(
          `UPDATE ${table('agentTurn')} turn SET
             "status" = 'failed',
             "error" = jsonb_build_object('code', thread."lastStreamError"->>'code', 'message', thread."lastStreamError"->>'message'),
             "endedAt" = COALESCE((thread."lastStreamError"->>'failedAt')::timestamptz, now())
           FROM ${table('agentChatThread')} thread
           WHERE thread."lastStreamError" IS NOT NULL
             AND turn."status" <> 'failed'
             AND turn.id = (
               SELECT latest.id FROM ${table('agentTurn')} latest
               WHERE latest."threadId" = thread.id
               ORDER BY latest."createdAt" DESC, latest.id DESC
               LIMIT 1
             )
             AND NOT EXISTS (
               SELECT 1 FROM ${table('agentTurn')} later
               WHERE later."threadId" = thread.id
                 AND later."createdAt" > COALESCE((thread."lastStreamError"->>'failedAt')::timestamptz, now())
             )
           RETURNING turn.id`,
        );

        return failedTurns.length;
      },
    );

    this.logger.log(
      `Workspace ${workspaceId}: marked ${failedTurnCount} turn(s) as failed`,
    );
  }

  async down(_args: RunOnWorkspaceArgs): Promise<void> {
    // The thread still holds the stream error it was backfilled from
  }
}
