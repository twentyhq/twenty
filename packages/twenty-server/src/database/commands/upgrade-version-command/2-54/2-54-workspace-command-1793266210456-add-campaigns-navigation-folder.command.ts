import { Inject } from '@nestjs/common';
import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  STANDARD_NAVIGATION_MENU_ITEM_DEFAULT_COLORS,
  STANDARD_NAVIGATION_MENU_ITEMS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import {
  createStandardNavigationMenuItemFolderFlatMetadata,
  createStandardNavigationMenuItemFolderItemFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-folder-flat-metadata.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CAMPAIGNS_FOLDER = STANDARD_NAVIGATION_MENU_ITEMS.campaignsFolder;

const CAMPAIGNS_FOLDER_ITEMS = [
  STANDARD_NAVIGATION_MENU_ITEMS.allMessageCampaigns,
  STANDARD_NAVIGATION_MENU_ITEMS.allMessageLists,
];

@RegisteredWorkspaceCommand('2.54.0', 1793266210456)
@Command({
  name: 'upgrade:2-54:add-campaigns-navigation-folder',
  description:
    'Add the Campaigns folder holding Campaigns and Lists to the navigation menu',
})
export class AddCampaignsNavigationFolderCommand extends ProvisionedWorkspaceCommandRunner {
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

    const isMissingCampaignViews = CAMPAIGNS_FOLDER_ITEMS.some(
      ({ viewUniversalIdentifier }) =>
        !isDefined(flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier]),
    );

    if (isMissingCampaignViews) {
      this.logger.warn(
        `Workspace ${workspaceId}: campaign or list view missing, skipping the Campaigns navigation folder`,
      );

      return;
    }

    const now = new Date().toISOString();

    const folder =
      flatNavigationMenuItemMaps.byUniversalIdentifier[
        CAMPAIGNS_FOLDER.universalIdentifier
      ] ??
      createStandardNavigationMenuItemFolderFlatMetadata({
        universalIdentifier: CAMPAIGNS_FOLDER.universalIdentifier,
        name: CAMPAIGNS_FOLDER.name,
        icon: CAMPAIGNS_FOLDER.icon,
        color:
          STANDARD_NAVIGATION_MENU_ITEM_DEFAULT_COLORS.campaignsFolder ?? null,
        position: CAMPAIGNS_FOLDER.position,
        navigationMenuItemId: v4(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        now,
      });

    const folderItems = CAMPAIGNS_FOLDER_ITEMS.map((folderItemDefinition) =>
      createStandardNavigationMenuItemFolderItemFlatMetadata({
        universalIdentifier: folderItemDefinition.universalIdentifier,
        viewUniversalIdentifier: folderItemDefinition.viewUniversalIdentifier,
        folderId: folder.id,
        folderUniversalIdentifier:
          folderItemDefinition.folderUniversalIdentifier,
        position: folderItemDefinition.position,
        navigationMenuItemId: v4(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        dependencyFlatEntityMaps: { flatViewMaps },
        now,
      }),
    );

    const navigationMenuItemsToCreate = [folder, ...folderItems].filter(
      ({ universalIdentifier }) =>
        !isDefined(
          flatNavigationMenuItemMaps.byUniversalIdentifier[universalIdentifier],
        ),
    );

    if (navigationMenuItemsToCreate.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating ${navigationMenuItemsToCreate.length} Campaigns navigation item(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: navigationMenuItemsToCreate,
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
