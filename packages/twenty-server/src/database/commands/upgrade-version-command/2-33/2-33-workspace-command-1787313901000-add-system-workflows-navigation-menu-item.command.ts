import { Command } from 'nest-commander';
import { v4 } from 'uuid';

import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { createStandardNavigationMenuItemSystemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-system-flat-metadata.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const SYSTEM_WORKFLOWS_DEFINITION =
  STANDARD_NAVIGATION_MENU_ITEMS.workflowsFolderSystemWorkflows;

@RegisteredWorkspaceCommand('2.33.0', 1787313901000)
@Command({
  name: 'upgrade:2-33:add-system-workflows-navigation-menu-item',
  description:
    'Add the SYSTEM workflows navigation menu item to existing workspaces, inside the standard Workflows folder when it still exists',
})
export class AddSystemWorkflowsNavigationMenuItemCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatNavigationMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
      ]);

    const existingItems = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const alreadyExists = existingItems.some(
      (item) =>
        item.universalIdentifier ===
        SYSTEM_WORKFLOWS_DEFINITION.universalIdentifier,
    );

    if (alreadyExists) {
      this.logger.log(
        `SYSTEM workflows navigation menu item already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const workflowsFolder = existingItems.find(
      (item) =>
        item.universalIdentifier ===
          SYSTEM_WORKFLOWS_DEFINITION.folderUniversalIdentifier &&
        item.userWorkspaceId === null,
    );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Adding the SYSTEM workflows navigation menu item for workspace ${workspaceId}${
        isDefined(workflowsFolder) ? '' : ' (workflows folder missing, adding at top level)'
      }`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const flatNavigationMenuItem =
      createStandardNavigationMenuItemSystemFlatMetadata({
        universalIdentifier: SYSTEM_WORKFLOWS_DEFINITION.universalIdentifier,
        systemPage: SYSTEM_WORKFLOWS_DEFINITION.systemPage,
        name: SYSTEM_WORKFLOWS_DEFINITION.name,
        icon: SYSTEM_WORKFLOWS_DEFINITION.icon,
        folderId: workflowsFolder?.id ?? null,
        folderUniversalIdentifier: isDefined(workflowsFolder)
          ? SYSTEM_WORKFLOWS_DEFINITION.folderUniversalIdentifier
          : null,
        position: SYSTEM_WORKFLOWS_DEFINITION.position,
        navigationMenuItemId: v4(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        now: new Date().toISOString(),
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [flatNavigationMenuItem],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to add the SYSTEM workflows navigation menu item:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to add the SYSTEM workflows navigation menu item for workspace ${workspaceId}`,
      );
    }
  }
}
