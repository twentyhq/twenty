import { Command } from 'nest-commander';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const LIST = STANDARD_OBJECTS.messageList;
const LIST_MEMBER = STANDARD_OBJECTS.messageListMember;
const PERSON = STANDARD_OBJECTS.person;
const LIST_RECORD_PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage;

const DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER =
  LIST.fields.description.universalIdentifier;
const DESCRIPTION_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  LIST.views.allMessageLists.viewFields.description.universalIdentifier;

const MEMBERS_VIEW_UNIVERSAL_IDENTIFIER =
  PERSON.views.messageListRecordPageMembers.universalIdentifier;
const MEMBERS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = Object.values(
  PERSON.views.messageListRecordPageMembers.viewFields,
).map((viewField) => viewField.universalIdentifier);
const MEMBERS_VIEW_FILTER_UNIVERSAL_IDENTIFIERS = Object.values(
  PERSON.views.messageListRecordPageMembers.viewFilters,
).map((viewFilter) => viewFilter.universalIdentifier);

const HOME_TAB_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.home.universalIdentifier;
const HOME_MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.home.widgets.members.universalIdentifier;
const MEMBERS_TAB_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.members.universalIdentifier;
const MEMBERS_TAB_WIDGET_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.members.widgets.members.universalIdentifier;

type RecordPageOperations = {
  pageLayoutTabsToCreate: FlatPageLayoutTab[];
  pageLayoutWidgetsToCreate: FlatPageLayoutWidget[];
  pageLayoutWidgetsToUpdate: FlatPageLayoutWidget[];
};

const EMPTY_RECORD_PAGE_OPERATIONS: RecordPageOperations = {
  pageLayoutTabsToCreate: [],
  pageLayoutWidgetsToCreate: [],
  pageLayoutWidgetsToUpdate: [],
};

@RegisteredWorkspaceCommand('2.39.0', 1788639798701)
@Command({
  name: 'upgrade:2-39:sync-message-list-record-page',
  description:
    'Add the messageList description field and its all lists view column, create the list members table view on person scoped through messageListMember, and give the list record page its members tab: the table fills a full screen tab of its own and sits under the fields in the side panel.',
})
export class SyncMessageListRecordPageCommand extends ProvisionedWorkspaceCommandRunner {
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

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFilterMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFilterMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    const listObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: LIST.universalIdentifier,
      });

    if (
      !isDefined(listObjectMetadata) ||
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          LIST_MEMBER.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `messageList objects do not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const fieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: [DESCRIPTION_FIELD_UNIVERSAL_IDENTIFIER],
      });

    const existingMembersView =
      flatViewMaps.byUniversalIdentifier[MEMBERS_VIEW_UNIVERSAL_IDENTIFIER];

    // A soft-deleted members view cannot be recreated under its identifier and
    // must not be embedded, so the workspace keeps its current record page.
    const isMembersViewDeleted = isDefined(existingMembersView?.deletedAt);

    if (isMembersViewDeleted) {
      this.logger.warn(
        `The list members view was deleted in workspace ${workspaceId}, leaving the record page untouched`,
      );
    }

    const viewsToCreate = isMembersViewDeleted
      ? []
      : getStandardFlatEntitiesToCreateOrThrow<FlatView>({
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
          existingFlatEntityMaps: flatViewMaps,
          universalIdentifiers: [MEMBERS_VIEW_UNIVERSAL_IDENTIFIER],
        });

    const viewFieldsToCreate = [
      ...(isMembersViewDeleted
        ? []
        : getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
            existingFlatEntityMaps: flatViewFieldMaps,
            universalIdentifiers: MEMBERS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
          })),
      ...this.computeDescriptionViewFieldsToCreate({
        workspaceId,
        listObjectMetadata,
        flatViewMaps,
        flatViewFieldMaps,
        standardFlatViewFieldMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
      }),
    ];

    const viewFiltersToCreate = isMembersViewDeleted
      ? []
      : getStandardFlatEntitiesToCreateOrThrow<FlatViewFilter>({
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFilterMaps,
          existingFlatEntityMaps: flatViewFilterMaps,
          universalIdentifiers: MEMBERS_VIEW_FILTER_UNIVERSAL_IDENTIFIERS,
        });

    const membersView = isMembersViewDeleted
      ? undefined
      : (existingMembersView ?? viewsToCreate[0]);

    const {
      pageLayoutTabsToCreate,
      pageLayoutWidgetsToCreate,
      pageLayoutWidgetsToUpdate,
    } = isDefined(membersView)
      ? this.computeRecordPageOperations({
          workspaceId,
          flatPageLayoutTabMaps,
          flatPageLayoutWidgetMaps,
          standardFlatPageLayoutTabMaps:
            standardAllFlatEntityMaps.flatPageLayoutTabMaps,
          standardFlatPageLayoutWidgetMaps:
            standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
          membersView,
          standardApplicationId: twentyStandardFlatApplication.id,
        })
      : EMPTY_RECORD_PAGE_OPERATIONS;

    const totalOperationCount =
      fieldsToCreate.length +
      viewsToCreate.length +
      viewFieldsToCreate.length +
      viewFiltersToCreate.length +
      pageLayoutTabsToCreate.length +
      pageLayoutWidgetsToCreate.length +
      pageLayoutWidgetsToUpdate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `messageList record page already up to date for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${fieldsToCreate.length} field(s), ${viewsToCreate.length} view(s), ${viewFieldsToCreate.length} view column(s), ${viewFiltersToCreate.length} view filter(s), ${pageLayoutTabsToCreate.length} tab(s), ${pageLayoutWidgetsToCreate.length} widget creation(s), ${pageLayoutWidgetsToUpdate.length} widget update(s)`,
    );

    if (isDryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: fieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
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
            viewFilter: {
              flatEntityToCreate: viewFiltersToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: pageLayoutTabsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: pageLayoutWidgetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: pageLayoutWidgetsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to sync the messageList record page for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
      );
    }

    this.logger.log(
      `Synced the messageList record page for workspace ${workspaceId}`,
    );
  }

  // Existing INDEX views keep their own column positions, so the description
  // column goes after every column already there instead of at its standard
  // position, which would collide with members. A soft-deleted column was
  // removed on purpose and stays removed.
  private computeDescriptionViewFieldsToCreate({
    workspaceId,
    listObjectMetadata,
    flatViewMaps,
    flatViewFieldMaps,
    standardFlatViewFieldMaps,
  }: {
    workspaceId: string;
    listObjectMetadata: FlatObjectMetadata;
    flatViewMaps: FlatEntityMaps<FlatView>;
    flatViewFieldMaps: FlatEntityMaps<FlatViewField>;
    standardFlatViewFieldMaps: FlatEntityMaps<FlatViewField>;
  }): FlatViewField[] {
    const existingDescriptionViewField =
      flatViewFieldMaps.byUniversalIdentifier[
        DESCRIPTION_VIEW_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (isDefined(existingDescriptionViewField)) {
      if (isDefined(existingDescriptionViewField.deletedAt)) {
        this.logger.log(
          `The description column was deleted from the all lists view in workspace ${workspaceId}, not recreating it`,
        );
      }

      return [];
    }

    const standardDescriptionViewField =
      findFlatEntityByUniversalIdentifier<FlatViewField>({
        flatEntityMaps: standardFlatViewFieldMaps,
        universalIdentifier: DESCRIPTION_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(standardDescriptionViewField)) {
      throw new Error(
        'Standard application is missing the messageList description view column',
      );
    }

    const listIndexFlatView = listObjectMetadata.viewUniversalIdentifiers
      .map(
        (viewUniversalIdentifier) =>
          flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier],
      )
      .filter(isDefined)
      .find(
        (flatView) =>
          flatView.key === ViewKey.INDEX && !isDefined(flatView.deletedAt),
      );

    if (!isDefined(listIndexFlatView)) {
      this.logger.warn(
        `No INDEX view found for messageList in workspace ${workspaceId}, skipping the description view column`,
      );

      return [];
    }

    const existingPositions = listIndexFlatView.viewFieldUniversalIdentifiers
      .map(
        (viewFieldUniversalIdentifier) =>
          flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier],
      )
      .filter(isDefined)
      .filter((flatViewField) => !isDefined(flatViewField.deletedAt))
      .map(({ position }) => position);

    return [
      {
        ...standardDescriptionViewField,
        viewUniversalIdentifier: listIndexFlatView.universalIdentifier,
        position:
          existingPositions.length === 0
            ? standardDescriptionViewField.position
            : Math.max(...existingPositions) + 1,
      },
    ];
  }

  // The members tab is new, so it is created wherever the list record page
  // exists. The two members widgets are only aligned with the standard shape
  // while they are still as twenty-standard provisioned them: a workspace that
  // edited a widget, or pointed it at another view, keeps what it built.
  private computeRecordPageOperations({
    workspaceId,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
    standardFlatPageLayoutTabMaps,
    standardFlatPageLayoutWidgetMaps,
    membersView,
    standardApplicationId,
  }: {
    workspaceId: string;
    flatPageLayoutTabMaps: FlatEntityMaps<FlatPageLayoutTab>;
    flatPageLayoutWidgetMaps: FlatEntityMaps<FlatPageLayoutWidget>;
    standardFlatPageLayoutTabMaps: FlatEntityMaps<FlatPageLayoutTab>;
    standardFlatPageLayoutWidgetMaps: FlatEntityMaps<FlatPageLayoutWidget>;
    membersView: FlatView;
    standardApplicationId: string;
  }): RecordPageOperations {
    const homeTab =
      flatPageLayoutTabMaps.byUniversalIdentifier[HOME_TAB_UNIVERSAL_IDENTIFIER];

    if (!isDefined(homeTab)) {
      this.logger.log(
        `messageList record page does not exist for workspace ${workspaceId}, leaving its layout untouched`,
      );

      return EMPTY_RECORD_PAGE_OPERATIONS;
    }

    const existingMembersTab =
      flatPageLayoutTabMaps.byUniversalIdentifier[
        MEMBERS_TAB_UNIVERSAL_IDENTIFIER
      ];

    if (isDefined(existingMembersTab?.deletedAt)) {
      this.logger.log(
        `The members tab was deleted from the list record page in workspace ${workspaceId}, not recreating it`,
      );
    }

    const isMembersTabAvailable =
      !isDefined(existingMembersTab) || !isDefined(existingMembersTab.deletedAt);

    const pageLayoutTabsToCreate = isMembersTabAvailable
      ? getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutTab>({
          standardFlatEntityMaps: standardFlatPageLayoutTabMaps,
          existingFlatEntityMaps: flatPageLayoutTabMaps,
          universalIdentifiers: [MEMBERS_TAB_UNIVERSAL_IDENTIFIER],
        })
      : [];

    const pageLayoutWidgetsToCreate = isMembersTabAvailable
      ? getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
          standardFlatEntityMaps: standardFlatPageLayoutWidgetMaps,
          existingFlatEntityMaps: flatPageLayoutWidgetMaps,
          universalIdentifiers: [MEMBERS_TAB_WIDGET_UNIVERSAL_IDENTIFIER],
        })
      : [];

    const pageLayoutWidgetsToUpdate = [
      HOME_MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER,
      MEMBERS_TAB_WIDGET_UNIVERSAL_IDENTIFIER,
    ].flatMap((widgetUniversalIdentifier) =>
      this.computeMembersWidgetUpdate({
        workspaceId,
        existingWidget:
          flatPageLayoutWidgetMaps.byUniversalIdentifier[
            widgetUniversalIdentifier
          ],
        standardWidget:
          standardFlatPageLayoutWidgetMaps.byUniversalIdentifier[
            widgetUniversalIdentifier
          ],
        membersView,
        standardApplicationId,
      }),
    );

    return {
      pageLayoutTabsToCreate,
      pageLayoutWidgetsToCreate,
      pageLayoutWidgetsToUpdate,
    };
  }

  private computeMembersWidgetUpdate({
    workspaceId,
    existingWidget,
    standardWidget,
    membersView,
    standardApplicationId,
  }: {
    workspaceId: string;
    existingWidget: FlatPageLayoutWidget | undefined;
    standardWidget: FlatPageLayoutWidget | undefined;
    membersView: FlatView;
    standardApplicationId: string;
  }): FlatPageLayoutWidget[] {
    if (!isDefined(existingWidget)) {
      return [];
    }

    if (!isDefined(standardWidget)) {
      throw new Error(
        `Standard application is missing the list record page widget ${existingWidget.universalIdentifier}`,
      );
    }

    if (
      existingWidget.configuration.configurationType !==
        WidgetConfigurationType.FIELD ||
      existingWidget.universalConfiguration.configurationType !==
        WidgetConfigurationType.FIELD
    ) {
      return [];
    }

    const { configuration, universalConfiguration } = existingWidget;

    const isCustomized =
      existingWidget.applicationId !== standardApplicationId ||
      isDefined(existingWidget.overrides) ||
      isDefined(existingWidget.deletedAt) ||
      !existingWidget.isActive ||
      (isDefined(configuration.viewId) &&
        configuration.viewId !== membersView.id);

    if (isCustomized) {
      this.logger.log(
        `The list record page widget ${existingWidget.universalIdentifier} was customized in workspace ${workspaceId}, leaving it untouched`,
      );

      return [];
    }

    const isAlignedWithStandard =
      configuration.fieldDisplayMode === FieldDisplayMode.TABLE &&
      configuration.viewId === membersView.id &&
      existingWidget.conditionalAvailabilityExpression ===
        standardWidget.conditionalAvailabilityExpression &&
      JSON.stringify(existingWidget.conditionalDisplay) ===
        JSON.stringify(standardWidget.conditionalDisplay);

    if (isAlignedWithStandard) {
      return [];
    }

    return [
      {
        ...existingWidget,
        configuration: {
          ...configuration,
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId: membersView.id,
        },
        universalConfiguration: {
          ...universalConfiguration,
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId: MEMBERS_VIEW_UNIVERSAL_IDENTIFIER,
        },
        conditionalDisplay: standardWidget.conditionalDisplay,
        conditionalAvailabilityExpression:
          standardWidget.conditionalAvailabilityExpression,
      },
    ];
  }
}
