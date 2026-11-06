import { Inject } from '@nestjs/common';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { createStandardNavigationMenuItemFolderItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-folder-flat-metadata.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const AGENTS_NAVIGATION_MENU_ITEM =
  STANDARD_NAVIGATION_MENU_ITEMS.workflowsFolderAllAgents;

@RegisteredWorkspaceCommand('2.57.0', 1793963783152)
@Command({
  name: 'upgrade:2-57:add-agents-navigation-menu-item',
  description:
    'Add the Agents native page to the Workflows folder of the navigation menu',
})
export class AddAgentsNavigationMenuItemCommand extends ProvisionedWorkspaceCommandRunner {
  @Inject(ApplicationService)
  private readonly applicationService: ApplicationService;

  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  @Inject(WorkspaceMigrationValidateBuildAndRunService)
  private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const { flatNavigationMenuItemMaps, flatViewMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
        'flatViewMaps',
      ]);

    if (
      isDefined(
        flatNavigationMenuItemMaps.byUniversalIdentifier[
          AGENTS_NAVIGATION_MENU_ITEM.universalIdentifier
        ],
      )
    ) {
      return;
    }

    const workflowsFolder =
      flatNavigationMenuItemMaps.byUniversalIdentifier[
        AGENTS_NAVIGATION_MENU_ITEM.folderUniversalIdentifier
      ];

    if (!isDefined(workflowsFolder)) {
      this.logger.log(
        `Workspace ${workspaceId}: Workflows folder was removed, skipping the Agents navigation item`,
      );

      return;
    }

    // Since 2.56 Agents can already be pinned by hand; don't add a second workspace-wide one.
    const hasWorkspaceAgentsItem = Object.values(
      flatNavigationMenuItemMaps.byUniversalIdentifier,
    ).some(
      (flatNavigationMenuItem) =>
        isDefined(flatNavigationMenuItem) &&
        flatNavigationMenuItem.type === NavigationMenuItemType.NATIVE_PAGE &&
        flatNavigationMenuItem.nativePageKey === 'agents' &&
        !isDefined(flatNavigationMenuItem.userWorkspaceId),
    );

    if (hasWorkspaceAgentsItem) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding the Agents navigation item`,
    );

    if (options.dryRun) {
      return;
    }

    const agentsNavigationMenuItem =
      createStandardNavigationMenuItemFolderItemFlatMetadata({
        universalIdentifier: AGENTS_NAVIGATION_MENU_ITEM.universalIdentifier,
        nativePageKey: AGENTS_NAVIGATION_MENU_ITEM.nativePageKey,
        folderId: workflowsFolder.id,
        folderUniversalIdentifier:
          AGENTS_NAVIGATION_MENU_ITEM.folderUniversalIdentifier,
        position: AGENTS_NAVIGATION_MENU_ITEM.position,
        navigationMenuItemId: v4(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        dependencyFlatEntityMaps: { flatViewMaps },
        now: new Date().toISOString(),
      });

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [agentsNavigationMenuItem],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
