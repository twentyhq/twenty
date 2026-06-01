import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const UNIVERSAL_IDENTIFIERS_TO_FIX = new Set<string>([
  STANDARD_COMMAND_MENU_ITEMS.askAi.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.viewPreviousAiChats.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.composeEmail.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.composeEmailToPerson.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.composeEmailToCompany.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.composeEmailToOpportunity.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsAccounts.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsAccountsEmails.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsAccountsCalendars.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsGeneral.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsObjects.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsMembers.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsRoles.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsDomains.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsBilling.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsApiWebhooks.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsApplications.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsAI.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsSecurity.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsUpdates.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.goToSettingsAdminPanel.universalIdentifier,
]);

@RegisteredWorkspaceCommand('2.8.0', 1798100010000)
@Command({
  name: 'upgrade:2-8:gate-default-command-menu-items-by-permission-flag',
  description:
    'Gate default command menu items (Ask AI, settings navigation, compose email) behind their relevant permission flags so members without permission no longer see them',
})
export class GateDefaultCommandMenuItemsByPermissionFlagCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
      `${isDryRun ? '[DRY RUN] ' : ''}Gating default command menu items by permission flag for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
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

    const itemsToUpdate = [...UNIVERSAL_IDENTIFIERS_TO_FIX]
      .map((universalIdentifier) => {
        const standardItem =
          standardAllFlatEntityMaps.flatCommandMenuItemMaps
            .byUniversalIdentifier[universalIdentifier];
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
          return undefined;
        }

        return {
          ...existingItem,
          conditionalAvailabilityExpression:
            standardItem.conditionalAvailabilityExpression,
          updatedAt: new Date().toISOString(),
        };
      })
      .filter(isDefined);

    if (itemsToUpdate.length === 0) {
      this.logger.log(
        `Default command menu item expressions already up to date for workspace ${workspaceId}`,
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
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to update command menu item availability expressions:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to gate default command menu items by permission flag for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully updated ${itemsToUpdate.length} command menu item availability expression(s) for workspace ${workspaceId}`,
    );
  }
}
