import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AgentHistoryUpgradeStorageService } from 'src/database/commands/agent-history/agent-history-upgrade-storage.service';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildAgentChatThreadRecordModelUpdates } from 'src/database/commands/upgrade-version-command/2-44/utils/build-agent-chat-thread-record-model-updates.util';
import { moveArchivedChatThreadsToSoftDelete } from 'src/database/commands/upgrade-version-command/2-44/utils/move-archived-chat-threads-to-soft-delete.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.44.0', 1790751626421)
@Command({
  name: 'upgrade:2-44:move-agent-chat-threads-to-record-model',
  description:
    'Turn archived conversations into soft deleted records, name conversations "Chat", identify them by title and let their title be edited',
})
export class MoveAgentChatThreadsToRecordModelCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly storage: AgentHistoryUpgradeStorageService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.apply(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.apply(args, 'down');
  }

  private async apply(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    // Workspaces without chat history objects get the new shape when the
    // 2.42 history move provisions them.
    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `agentChatThread object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { objectToUpdate, fieldsToUpdate } =
      buildAgentChatThreadRecordModelUpdates({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        now: new Date().toISOString(),
        direction,
      });
    const hasArchivedAtField = isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.fields.archivedAt.universalIdentifier
      ],
    );

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId} (${direction}): would ${isDefined(objectToUpdate) ? 'update the chat object, ' : ''}update ${fieldsToUpdate.length} chat field(s)${hasArchivedAtField ? ' and move archived chats' : ''}`,
      );

      return;
    }

    if (isDefined(objectToUpdate) || fieldsToUpdate.length > 0) {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
          {
            workspaceId,
            isSystemBuild: true,
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            allFlatEntityOperationByMetadataName: {
              objectMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: isDefined(objectToUpdate)
                  ? [objectToUpdate]
                  : [],
              },
              fieldMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: fieldsToUpdate,
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }

    if (!hasArchivedAtField) {
      return;
    }

    const movedCount = await this.storage.run(workspaceId, ({ manager }) =>
      moveArchivedChatThreadsToSoftDelete({ manager, workspaceId, direction }),
    );

    this.logger.log(
      `Workspace ${workspaceId} (${direction}): moved ${movedCount} archived chat(s)`,
    );
  }
}
