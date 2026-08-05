import { Command } from 'nest-commander';

import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeTwentyStandardApplicationAllFlatEntityMapsPre228 } from 'src/database/commands/upgrade-version-command/2-10/utils/compute-twenty-standard-application-all-flat-entity-maps-pre-2-28.util';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Pre-2.27 literals, pinned: this command runs before the 2-28 record-page
// reconcile, when workspace rows still hold the pre-derivation universal
// identifiers; the shared constants now resolve to the derived scheme.
const MESSAGE_CAMPAIGN_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER =
  '20202020-a009-4a09-8a09-fa9de11ca901';

const MESSAGE_CAMPAIGN_RECORD_PAGE_FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  '20202020-af09-4a09-8a09-fa9de11ca903',
  '20202020-af09-4a09-8a09-fa9de11ca904',
  '20202020-af09-4a09-8a09-fa9de11ca905',
  '20202020-af09-4a09-8a09-fa9de11ca906',
  '20202020-af09-4a09-8a09-fa9de11ca907',
  '20202020-af09-4a09-8a09-fa9de11ca908',
];

const MESSAGE_CAMPAIGN_RECORD_PAGE_FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS =
  ['20202020-a009-4a09-8a09-fa9de11ca902'];

const MESSAGE_CAMPAIGN_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  '8704b091-94bd-4f8f-82b1-e2f3eab92217';

const HOME_TAB_UNIVERSAL_IDENTIFIER = 'f16785cd-a5b7-4ec1-8f20-ff8b80fb94b9';

const COMPOSER_TAB_UNIVERSAL_IDENTIFIER =
  '5f21c19d-6c3e-4b8a-9d47-1e8f02a63b71';

const COMPOSER_WIDGET_UNIVERSAL_IDENTIFIER =
  '9c74d8e2-0b5f-4a19-8630-57d2ba14ce92';

const HOME_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  '886296e0-a5b6-4054-b450-ad624180c2ef';

const HOME_DETAILS_WIDGET_UNIVERSAL_IDENTIFIER =
  'ce2f82cc-9340-45a2-90a0-c34207e8e3b0';

const HOME_LIST_WIDGET_UNIVERSAL_IDENTIFIER =
  'b04fb8a5-f471-49a7-b82c-8434ea8276c5';

const HOME_RECIPIENTS_WIDGET_UNIVERSAL_IDENTIFIER =
  'b667f20a-1d38-453e-b888-3ecab00a1044';

const HOME_OBSOLETE_MESSAGES_WIDGET_UNIVERSAL_IDENTIFIER =
  'a33b43f4-72a1-476d-9372-30e82f450377';

@RegisteredWorkspaceCommand('2.25.0', 1785229940000)
@Command({
  name: 'upgrade:2-25:add-message-campaign-composer-tab',
  description:
    'Aligns the message campaign record page with the Note layout: a home Fields tab (left column) plus an Email tab holding the composer editor',
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
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
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

    const standardAllFlatEntityMaps =
      computeTwentyStandardApplicationAllFlatEntityMapsPre228({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const pageLayoutTabsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutTab>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutTabMaps,
        existingFlatEntityMaps: flatPageLayoutTabMaps,
        universalIdentifiers: [
          HOME_TAB_UNIVERSAL_IDENTIFIER,
          COMPOSER_TAB_UNIVERSAL_IDENTIFIER,
        ],
      });

    const pageLayoutWidgetsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
        existingFlatEntityMaps: flatPageLayoutWidgetMaps,
        universalIdentifiers: [
          HOME_DETAILS_WIDGET_UNIVERSAL_IDENTIFIER,
          COMPOSER_WIDGET_UNIVERSAL_IDENTIFIER,
          HOME_LIST_WIDGET_UNIVERSAL_IDENTIFIER,
          HOME_RECIPIENTS_WIDGET_UNIVERSAL_IDENTIFIER,
          HOME_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
        ],
      });

    const viewsToCreate = getStandardFlatEntitiesToCreateOrThrow<FlatView>({
      standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
      existingFlatEntityMaps: flatViewMaps,
      universalIdentifiers: [
        MESSAGE_CAMPAIGN_RECORD_PAGE_FIELDS_VIEW_UNIVERSAL_IDENTIFIER,
      ],
    });

    const viewFieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
        existingFlatEntityMaps: flatViewFieldMaps,
        universalIdentifiers:
          MESSAGE_CAMPAIGN_RECORD_PAGE_FIELDS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      });

    const viewFieldGroupsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewFieldGroup>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatViewFieldGroupMaps,
        existingFlatEntityMaps: flatViewFieldGroupMaps,
        universalIdentifiers:
          MESSAGE_CAMPAIGN_RECORD_PAGE_FIELDS_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS,
      });

    const existingComposerTab =
      flatPageLayoutTabMaps.byUniversalIdentifier[
        COMPOSER_TAB_UNIVERSAL_IDENTIFIER
      ];
    const standardComposerTab =
      standardAllFlatEntityMaps.flatPageLayoutTabMaps.byUniversalIdentifier[
        COMPOSER_TAB_UNIVERSAL_IDENTIFIER
      ];

    const pageLayoutTabsToUpdate =
      isDefined(existingComposerTab) &&
      isDefined(standardComposerTab) &&
      existingComposerTab.layoutMode !== standardComposerTab.layoutMode
        ? [
            {
              ...existingComposerTab,
              layoutMode: standardComposerTab.layoutMode,
              title: standardComposerTab.title,
            },
          ]
        : [];

    const pageLayoutWidgetsToUpdate = [
      HOME_DETAILS_WIDGET_UNIVERSAL_IDENTIFIER,
      HOME_FIELDS_WIDGET_UNIVERSAL_IDENTIFIER,
      HOME_LIST_WIDGET_UNIVERSAL_IDENTIFIER,
      HOME_RECIPIENTS_WIDGET_UNIVERSAL_IDENTIFIER,
    ]
      .map((universalIdentifier) => {
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
      })
      .filter((widget): widget is FlatPageLayoutWidget => isDefined(widget));

    const obsoleteMessagesWidget =
      flatPageLayoutWidgetMaps.byUniversalIdentifier[
        HOME_OBSOLETE_MESSAGES_WIDGET_UNIVERSAL_IDENTIFIER
      ];

    const pageLayoutWidgetsToDelete = isDefined(obsoleteMessagesWidget)
      ? [obsoleteMessagesWidget]
      : [];

    const totalOperationCount =
      pageLayoutTabsToCreate.length +
      pageLayoutWidgetsToCreate.length +
      pageLayoutTabsToUpdate.length +
      pageLayoutWidgetsToUpdate.length +
      pageLayoutWidgetsToDelete.length +
      viewsToCreate.length +
      viewFieldsToCreate.length +
      viewFieldGroupsToCreate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `Message campaign record page already has the home and email tabs for workspace ${workspaceId}, skipping`,
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
            pageLayoutTab: {
              flatEntityToCreate: pageLayoutTabsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: pageLayoutTabsToUpdate,
            },
            pageLayoutWidget: {
              flatEntityToCreate: pageLayoutWidgetsToCreate,
              flatEntityToDelete: pageLayoutWidgetsToDelete,
              flatEntityToUpdate: pageLayoutWidgetsToUpdate,
            },
            view: {
              flatEntityToCreate: viewsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: viewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: viewFieldGroupsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to align the message campaign record page for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Aligned the message campaign record page for workspace ${workspaceId}`,
    );
  }
}
