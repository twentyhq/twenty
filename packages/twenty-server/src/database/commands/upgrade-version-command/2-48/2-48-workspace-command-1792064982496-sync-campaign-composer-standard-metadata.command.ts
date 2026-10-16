import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildCampaignComposerStandardMetadataOperations } from 'src/database/commands/upgrade-version-command/2-48/utils/build-campaign-composer-standard-metadata-operations.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.48.0', 1792064982496)
@Command({
  name: 'upgrade:2-48:sync-campaign-composer-standard-metadata',
  description:
    'Bring existing workspaces to the campaign composer standard metadata: drop "count" from the campaign count field labels, turn Block Settings into Add Block next to a new Email Style command, and stop offering to create list members from the UI',
})
export class SyncCampaignComposerStandardMetadataCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.sync(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.sync(args, 'down');
  }

  private async sync(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const flatEntityMaps = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatCommandMenuItemMaps',
      ],
    );

    const operations = buildCampaignComposerStandardMetadataOperations({
      ...flatEntityMaps,
      workspaceId,
      direction,
      now: new Date().toISOString(),
    });

    const {
      flatObjectMetadatasToUpdate,
      flatFieldMetadatasToUpdate,
      flatCommandMenuItemsToCreate,
      flatCommandMenuItemsToDelete,
      flatCommandMenuItemsToUpdate,
    } = operations;

    if (
      Object.values(operations).every(
        (flatEntities) => flatEntities.length === 0,
      )
    ) {
      this.logger.log(
        `Campaign composer standard metadata already in sync for workspace ${workspaceId} (${direction}), skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId} (${direction}): relabelling ${flatFieldMetadatasToUpdate.length} campaign count field(s), updating ${flatObjectMetadatasToUpdate.length} list member object(s), creating ${flatCommandMenuItemsToCreate.length}, deleting ${flatCommandMenuItemsToDelete.length} and updating ${flatCommandMenuItemsToUpdate.length} campaign design command menu item(s)`,
    );

    if (isDryRun) {
      return;
    }

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
              flatEntityToUpdate: flatObjectMetadatasToUpdate,
            },
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatFieldMetadatasToUpdate,
            },
            commandMenuItem: {
              flatEntityToCreate: flatCommandMenuItemsToCreate,
              flatEntityToDelete: flatCommandMenuItemsToDelete,
              flatEntityToUpdate: flatCommandMenuItemsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to sync the campaign composer standard metadata for workspace ${workspaceId}`,
      );
    }
  }
}
