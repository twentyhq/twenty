import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildTranscriptPageLayoutTabUpdates } from 'src/database/commands/upgrade-version-command/2-43/utils/build-transcript-page-layout-tab-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.43.0', 1790322700000)
@Command({
  name: 'upgrade:2-43:rename-call-recording-tabs-to-transcript',
  description:
    'Rename the standard Calendar Event and Call Recording transcript tabs while preserving workspace customizations',
})
export class RenameCallRecordingTabsToTranscriptCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.renameTranscriptMetadata(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.renameTranscriptMetadata(args, 'down');
  }

  private async renameTranscriptMetadata(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const { flatPageLayoutTabMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutTabMaps',
      ]);
    const pageLayoutTabsToUpdate = buildTranscriptPageLayoutTabUpdates({
      flatPageLayoutTabsByUniversalIdentifier:
        flatPageLayoutTabMaps.byUniversalIdentifier,
      now: new Date().toISOString(),
      direction,
    });

    if (pageLayoutTabsToUpdate.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: updating ${pageLayoutTabsToUpdate.length} transcript tab(s)`,
    );

    if (options.dryRun) {
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
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: pageLayoutTabsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
