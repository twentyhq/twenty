import { Inject } from '@nestjs/common';
import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildCommandMenuItemPlaceholderUpdates } from 'src/database/commands/upgrade-version-command/2-50/utils/build-command-menu-item-placeholder-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.50.0', 1792501783605)
@Command({
  name: 'upgrade:2-50:repair-command-menu-item-label-placeholders',
  description:
    'Repair legacy placeholders in standard command menu item display fields and their overrides',
})
export class RepairCommandMenuItemLabelPlaceholdersCommand extends ProvisionedWorkspaceCommandRunner {
  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  @Inject(WorkspaceMigrationValidateBuildAndRunService)
  private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const updates = buildCommandMenuItemPlaceholderUpdates({
      commandMenuItems: Object.values(
        flatCommandMenuItemMaps.byUniversalIdentifier,
      ),
      now: new Date().toISOString(),
    });

    if (!isNonEmptyArray(updates)) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: repairing ${updates.length} command menu item(s)`,
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
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: updates,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to repair command menu item placeholders for workspace ${workspaceId}`,
      );
    }
  }

  async down(): Promise<void> {
    return;
  }
}
