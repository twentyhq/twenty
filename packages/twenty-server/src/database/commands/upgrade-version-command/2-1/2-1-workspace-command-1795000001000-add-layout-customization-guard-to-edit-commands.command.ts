import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { replaceLegacyPageEditModeIdentifier } from 'src/database/commands/upgrade-version-command/2-1/utils/replace-legacy-page-edit-mode-identifier.util';

const UNIVERSAL_IDENTIFIERS_TO_UPDATE = new Set<string>([
  STANDARD_COMMAND_MENU_ITEMS.editRecordPageLayout.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.editDashboardLayout.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.saveDashboardLayout.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.cancelDashboardLayout.universalIdentifier,
]);

@RegisteredWorkspaceCommand('2.1.0', 1795000001000)
@Command({
  name: 'upgrade:2-1:add-layout-customization-guard-to-edit-commands',
  description:
    'Guard layout edit commands and migrate legacy page edit-mode expressions',
})
export class AddLayoutCustomizationGuardToEditCommandsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
      `${isDryRun ? '[DRY RUN] ' : ''}Starting Edit command availability expression update for workspace ${workspaceId}`,
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
    const itemsToUpdateById: Record<string, FlatCommandMenuItem> = {};

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

      itemsToUpdateById[existingItem.id] = {
        ...existingItem,
        conditionalAvailabilityExpression:
          standardItem.conditionalAvailabilityExpression,
        updatedAt,
      };
    }

    for (const existingItem of Object.values(
      existingFlatCommandMenuItemMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      if (
        UNIVERSAL_IDENTIFIERS_TO_UPDATE.has(existingItem.universalIdentifier)
      ) {
        continue;
      }

      const currentConditionalAvailabilityExpression =
        existingItem.conditionalAvailabilityExpression;

      const nextConditionalAvailabilityExpression =
        replaceLegacyPageEditModeIdentifier(
          currentConditionalAvailabilityExpression,
        );

      if (
        nextConditionalAvailabilityExpression ===
        currentConditionalAvailabilityExpression
      ) {
        continue;
      }

      itemsToUpdateById[existingItem.id] = {
        ...existingItem,
        conditionalAvailabilityExpression:
          nextConditionalAvailabilityExpression,
        updatedAt,
      };
    }

    const itemsToUpdate = Object.values(itemsToUpdateById);

    if (itemsToUpdate.length === 0) {
      this.logger.log(
        `Edit command availability expressions already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${itemsToUpdate.length} command menu item(s) to update for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would update ${itemsToUpdate.length} Edit command availability expression(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
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
        `Failed to update Edit command availability expressions:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to update Edit command availability expressions for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully updated ${itemsToUpdate.length} Edit command availability expression(s) for workspace ${workspaceId}`,
    );
  }
}
