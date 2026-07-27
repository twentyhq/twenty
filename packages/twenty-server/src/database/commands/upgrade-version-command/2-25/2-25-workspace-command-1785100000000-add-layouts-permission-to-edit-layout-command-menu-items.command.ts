import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const UNIVERSAL_IDENTIFIERS_TO_UPDATE = new Set<string>([
  STANDARD_COMMAND_MENU_ITEMS.editRecordPageLayout.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.editDashboardLayout.universalIdentifier,
]);

@RegisteredWorkspaceCommand('2.25.0', 1785100000000)
@Command({
  name: 'upgrade:2-25:add-layouts-permission-to-edit-layout-command-menu-items',
  description:
    'Gate Edit Layout and Edit Dashboard command menu items behind the LAYOUTS permission flag',
})
export class AddLayoutsPermissionToEditLayoutCommandMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Gating edit layout command menu items by LAYOUTS permission flag for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const updatedAt = new Date().toISOString();
    const itemsToUpdate: FlatCommandMenuItem[] = [];

    for (const universalIdentifier of UNIVERSAL_IDENTIFIERS_TO_UPDATE) {
      const standardItem =
        standardAllFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
          universalIdentifier
        ];
      const existingItem =
        existingFlatCommandMenuItemMaps.byUniversalIdentifier[
          universalIdentifier
        ];

      if (
        !isDefined(standardItem) ||
        !isDefined(existingItem) ||
        existingItem.conditionalAvailabilityExpression ===
          standardItem.conditionalAvailabilityExpression
      ) {
        continue;
      }

      itemsToUpdate.push({
        ...existingItem,
        conditionalAvailabilityExpression:
          standardItem.conditionalAvailabilityExpression,
        updatedAt,
      });
    }

    if (itemsToUpdate.length === 0) {
      this.logger.log(
        `Edit layout command menu item expressions already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${itemsToUpdate.length} command menu item(s) to update for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would update ${itemsToUpdate.length} command menu item availability expression(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: itemsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to update edit layout command menu item availability expressions:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to gate edit layout command menu items by LAYOUTS permission flag for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully updated ${itemsToUpdate.length} command menu item availability expression(s) for workspace ${workspaceId}`,
    );
  }
}
