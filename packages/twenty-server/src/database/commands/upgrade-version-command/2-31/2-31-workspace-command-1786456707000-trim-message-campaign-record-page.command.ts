import { Command } from 'nest-commander';

import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const MESSAGE_CAMPAIGN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage
    .universalIdentifier;

const HOME_WIDGETS =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs.home
    .widgets;

// details: its fields now sit above the body in the composer.
// list: the envelope above the sent body already names the list it went to.
const REMOVED_WIDGET_UNIVERSAL_IDENTIFIERS = [
  HOME_WIDGETS.details.universalIdentifier,
  HOME_WIDGETS.list.universalIdentifier,
];

// The widgets that stay move from "not everyEquals" to "noneEquals". The two
// agree on a loaded record, but an empty selection makes the first true and the
// second false, and the selection is empty until the record loads.
const SENT_ONLY_WIDGET_UNIVERSAL_IDENTIFIERS = [
  HOME_WIDGETS.fields.universalIdentifier,
  HOME_WIDGETS.recipients.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.31.0', 1786456707000)
@Command({
  name: 'upgrade:2-31:trim-message-campaign-record-page',
  description:
    'Removes the message campaign details and list widgets, both of which the envelope above the body now covers, and makes the widgets that stay fail closed while the record loads',
})
export class TrimMessageCampaignRecordPageCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatPageLayoutMaps, flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutMaps',
        'flatPageLayoutWidgetMaps',
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

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const pageLayoutWidgetsToDelete = REMOVED_WIDGET_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        flatPageLayoutWidgetMaps.byUniversalIdentifier[universalIdentifier],
    ).filter((widget): widget is FlatPageLayoutWidget => isDefined(widget));

    const pageLayoutWidgetsToUpdate = SENT_ONLY_WIDGET_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) => {
        const existingWidget =
          flatPageLayoutWidgetMaps.byUniversalIdentifier[universalIdentifier];
        const standardWidget =
          standardAllFlatEntityMaps.flatPageLayoutWidgetMaps
            .byUniversalIdentifier[universalIdentifier];

        if (
          !isDefined(existingWidget) ||
          !isDefined(standardWidget) ||
          existingWidget.conditionalAvailabilityExpression ===
            standardWidget.conditionalAvailabilityExpression
        ) {
          return null;
        }

        return {
          ...existingWidget,
          conditionalAvailabilityExpression:
            standardWidget.conditionalAvailabilityExpression,
        };
      },
    ).filter((widget): widget is FlatPageLayoutWidget => isDefined(widget));

    const totalOperationCount =
      pageLayoutWidgetsToDelete.length + pageLayoutWidgetsToUpdate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `Message campaign record page already up to date for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Applying ${totalOperationCount} message campaign record page operation(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutWidgetsToDelete,
              flatEntityToUpdate: pageLayoutWidgetsToUpdate,
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to update the message campaign record page for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Updated the message campaign record page for workspace ${workspaceId}`,
    );
  }
}
