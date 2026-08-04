import { Command } from 'nest-commander';

import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  remapRecordPageUniversalIdentifiersToPre228,
  toPre228RecordPageUniversalIdentifier,
} from 'src/database/commands/upgrade-version-command/2-10/utils/remap-record-page-universal-identifiers-to-pre-2-28.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const SEND_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = [
  STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaignTest.universalIdentifier,
];

const MESSAGE_CAMPAIGN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  toPre228RecordPageUniversalIdentifier(
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage
      .universalIdentifier,
  );

const REALIGNED_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = [
  STANDARD_COMMAND_MENU_ITEMS.navigateToNextRecord.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.navigateToPreviousRecord.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.addToFavorites.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.removeFromFavorites.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.25.0', 1785229960000)
@Command({
  name: 'upgrade:2-25:configure-message-campaign-command-menu',
  description:
    'Adds the Send Campaign and Send Test Email record actions and hides the favorite/record-navigation actions on message campaign record pages in existing workspaces',
})
export class ConfigureMessageCampaignCommandMenuCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps,
      flatPageLayoutMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatCommandMenuItemMaps',
      'flatPageLayoutMaps',
    ]);

    const existingPageLayout =
      flatPageLayoutMaps.byUniversalIdentifier[
        MESSAGE_CAMPAIGN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(existingPageLayout)) {
      this.logger.log(
        `Message campaign page layout does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { allFlatEntityMaps: derivedStandardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    // This command predates the 2-28 record-page reconcile: workspace rows
    // still hold the pre-derivation universal identifiers.
    const standardAllFlatEntityMaps =
      remapRecordPageUniversalIdentifiersToPre228(
        derivedStandardAllFlatEntityMaps,
      );

    const itemsToCreate = SEND_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.filter(
      (universalIdentifier) =>
        !isDefined(
          existingFlatCommandMenuItemMaps.byUniversalIdentifier[
            universalIdentifier
          ],
        ),
    )
      .map(
        (universalIdentifier) =>
          standardAllFlatEntityMaps.flatCommandMenuItemMaps
            .byUniversalIdentifier[universalIdentifier],
      )
      .filter((item): item is FlatCommandMenuItem => isDefined(item));

    const itemsToUpdate = REALIGNED_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) => {
        const existingItem =
          existingFlatCommandMenuItemMaps.byUniversalIdentifier[
            universalIdentifier
          ];
        const standardItem =
          standardAllFlatEntityMaps.flatCommandMenuItemMaps
            .byUniversalIdentifier[universalIdentifier];

        if (
          !isDefined(existingItem) ||
          !isDefined(standardItem) ||
          existingItem.conditionalAvailabilityExpression ===
            standardItem.conditionalAvailabilityExpression
        ) {
          return null;
        }

        return {
          ...existingItem,
          conditionalAvailabilityExpression:
            standardItem.conditionalAvailabilityExpression,
        };
      },
    ).filter((item): item is FlatCommandMenuItem => isDefined(item));

    const totalOperationCount = itemsToCreate.length + itemsToUpdate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `Message campaign command menu already configured for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Configuring message campaign command menu (${itemsToCreate.length} to add, ${itemsToUpdate.length} to realign) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: itemsToCreate,
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
      throw new Error(
        `Failed to configure message campaign command menu for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Configured message campaign command menu for workspace ${workspaceId}`,
    );
  }
}
