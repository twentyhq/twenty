import { Command } from 'nest-commander';

import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const MESSAGE_CAMPAIGN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage
    .universalIdentifier;

const HOME_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs.home
    .universalIdentifier;

const COMPOSER_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs
    .composer.universalIdentifier;

const COMPOSER_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs
    .composer.widgets.messageCampaign.universalIdentifier;

const HOME_TAB_STANDARD_WIDGET_UNIVERSAL_IDENTIFIERS = Object.values(
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageCampaignRecordPage.tabs.home
    .widgets,
).map((widget) => widget.universalIdentifier);

@RegisteredWorkspaceCommand('2.24.0', 1784663000000)
@Command({
  name: 'upgrade:2-24:add-message-campaign-composer-tab',
  description:
    'Adds the Composer canvas tab to the message campaign record page in existing workspaces',
})
export class AddMessageCampaignComposerTabCommand extends ProvisionedWorkspaceCommandRunner {
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

    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
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

    const pageLayoutTabsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutTab>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutTabMaps,
        existingFlatEntityMaps: flatPageLayoutTabMaps,
        universalIdentifiers: [COMPOSER_TAB_UNIVERSAL_IDENTIFIER],
      });

    const pageLayoutWidgetsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
        existingFlatEntityMaps: flatPageLayoutWidgetMaps,
        universalIdentifiers: [COMPOSER_WIDGET_UNIVERSAL_IDENTIFIER],
      });

    // The composer is the only tab, so the record page renders it full width
    // instead of pinning the fields tab down the left side.
    const existingHomeTab =
      flatPageLayoutTabMaps.byUniversalIdentifier[
        HOME_TAB_UNIVERSAL_IDENTIFIER
      ];

    const existingHomeTabWidgets = isDefined(existingHomeTab)
      ? Object.values(flatPageLayoutWidgetMaps.byUniversalIdentifier).filter(
          (widget): widget is FlatPageLayoutWidget =>
            isDefined(widget) && widget.pageLayoutTabId === existingHomeTab.id,
        )
      : [];

    const pageLayoutWidgetsToDelete = existingHomeTabWidgets.filter((widget) =>
      HOME_TAB_STANDARD_WIDGET_UNIVERSAL_IDENTIFIERS.includes(
        widget.universalIdentifier,
      ),
    );

    // A home tab holding user-added widgets is kept so their widgets survive
    const hasOnlyStandardHomeTabWidgets =
      pageLayoutWidgetsToDelete.length === existingHomeTabWidgets.length;

    const pageLayoutTabsToDelete =
      isDefined(existingHomeTab) && hasOnlyStandardHomeTabWidgets
        ? [existingHomeTab]
        : [];

    const shouldUpdateDefaultTab = isDefined(
      existingPageLayout.defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
    );

    const totalOperationCount =
      pageLayoutTabsToCreate.length +
      pageLayoutWidgetsToCreate.length +
      pageLayoutTabsToDelete.length +
      pageLayoutWidgetsToDelete.length +
      (shouldUpdateDefaultTab ? 1 : 0);

    if (totalOperationCount === 0) {
      this.logger.log(
        `Message campaign composer tab already the only tab for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Applying ${totalOperationCount} message campaign composer tab operation(s) for workspace ${workspaceId}`,
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
            pageLayoutTab: {
              flatEntityToCreate: pageLayoutTabsToCreate,
              flatEntityToDelete: pageLayoutTabsToDelete,
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: pageLayoutWidgetsToCreate,
              flatEntityToDelete: pageLayoutWidgetsToDelete,
              flatEntityToUpdate: [],
            },
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: shouldUpdateDefaultTab
                ? [
                    {
                      ...existingPageLayout,
                      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
                        null,
                    },
                  ]
                : [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to add the message campaign composer tab for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Added the message campaign composer tab for workspace ${workspaceId}`,
    );
  }
}
