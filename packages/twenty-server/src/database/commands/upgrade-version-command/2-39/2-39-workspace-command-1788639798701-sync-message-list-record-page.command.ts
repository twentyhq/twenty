import { Command } from 'nest-commander';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode, ViewKey } from 'twenty-shared/types';
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
import { MESSAGE_LIST_GRID_LAYOUT_POSITIONS } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-message-list-page-layout.config';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const LIST = STANDARD_OBJECTS.messageList;
const LIST_MEMBER = STANDARD_OBJECTS.messageListMember;
const PERSON = STANDARD_OBJECTS.person;
const LIST_RECORD_PAGE = STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.messageListRecordPage;

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
const FIELDS_WIDGET_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.home.widgets.fields.universalIdentifier;
const MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER =
  LIST_RECORD_PAGE.tabs.home.widgets.members.universalIdentifier;

type RecordPageOperations = {
  pageLayoutTabsToUpdate: FlatPageLayoutTab[];
  pageLayoutWidgetsToUpdate: FlatPageLayoutWidget[];
  skipReason?: 'missing' | 'customized' | 'already migrated';
};

@RegisteredWorkspaceCommand('2.39.0', 1788639798701)
@Command({
  name: 'upgrade:2-39:sync-message-list-record-page',
  description:
    'Add the messageList description field and its all lists view column, create the list members table view on person scoped through messageListMember, and move the uncustomized list record page to a two column grid embedding that view in the members widget.',
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
    // must not be embedded, so the workspace keeps its current members widget.
    const isMembersViewDeleted = isDefined(existingMembersView?.deletedAt);

    if (isMembersViewDeleted) {
      this.logger.warn(
        `The list members view was deleted in workspace ${workspaceId}, leaving the members widget untouched`,
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

    const { pageLayoutTabsToUpdate, pageLayoutWidgetsToUpdate, skipReason } =
      this.computeRecordPageOperations({
        flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps,
        membersView,
        standardApplicationId: twentyStandardFlatApplication.id,
      });

    if (isDefined(skipReason)) {
      this.logger.log(
        `messageList record page is ${skipReason} for workspace ${workspaceId}, leaving its layout untouched`,
      );
    }

    const totalOperationCount =
      fieldsToCreate.length +
      viewsToCreate.length +
      viewFieldsToCreate.length +
      viewFiltersToCreate.length +
      pageLayoutTabsToUpdate.length +
      pageLayoutWidgetsToUpdate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `messageList record page already up to date for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${fieldsToCreate.length} field(s), ${viewsToCreate.length} view(s), ${viewFieldsToCreate.length} view column(s), ${viewFiltersToCreate.length} view filter(s), ${pageLayoutTabsToUpdate.length} tab update(s), ${pageLayoutWidgetsToUpdate.length} widget update(s)`,
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
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: pageLayoutTabsToUpdate,
            },
            pageLayoutWidget: {
              flatEntityToCreate: [],
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

  // Only a layout still exactly as twenty-standard provisioned it is moved to
  // the grid: a workspace that edited its list page keeps what it built.
  private computeRecordPageOperations({
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
    membersView,
    standardApplicationId,
  }: {
    flatPageLayoutTabMaps: FlatEntityMaps<FlatPageLayoutTab>;
    flatPageLayoutWidgetMaps: FlatEntityMaps<FlatPageLayoutWidget>;
    membersView: FlatView | undefined;
    standardApplicationId: string;
  }): RecordPageOperations {
    const homeTab =
      flatPageLayoutTabMaps.byUniversalIdentifier[HOME_TAB_UNIVERSAL_IDENTIFIER];
    const fieldsWidget =
      flatPageLayoutWidgetMaps.byUniversalIdentifier[
        FIELDS_WIDGET_UNIVERSAL_IDENTIFIER
      ];
    const membersWidget =
      flatPageLayoutWidgetMaps.byUniversalIdentifier[
        MEMBERS_WIDGET_UNIVERSAL_IDENTIFIER
      ];

    if (
      !isDefined(homeTab) ||
      !isDefined(fieldsWidget) ||
      !isDefined(membersWidget) ||
      !isDefined(membersView) ||
      membersWidget.configuration.configurationType !==
        WidgetConfigurationType.FIELD ||
      membersWidget.universalConfiguration.configurationType !==
        WidgetConfigurationType.FIELD
    ) {
      return {
        pageLayoutTabsToUpdate: [],
        pageLayoutWidgetsToUpdate: [],
        skipReason: 'missing',
      };
    }

    const isMembersWidgetEmbeddingView =
      membersWidget.configuration.fieldDisplayMode === FieldDisplayMode.TABLE &&
      isDefined(membersWidget.configuration.viewId);

    if (
      homeTab.layoutMode === PageLayoutTabLayoutMode.GRID &&
      isMembersWidgetEmbeddingView
    ) {
      return {
        pageLayoutTabsToUpdate: [],
        pageLayoutWidgetsToUpdate: [],
        skipReason: 'already migrated',
      };
    }

    const isCustomized = [homeTab, fieldsWidget, membersWidget].some(
      (flatEntity) =>
        flatEntity.applicationId !== standardApplicationId ||
        isDefined(flatEntity.overrides) ||
        !flatEntity.isActive,
    );

    // A layout provisioned from the current standard config by an earlier
    // upgrade step already sits on the grid, with a table widget that could
    // not embed the members view since it did not exist yet.
    const isStandardLayoutMode =
      homeTab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST ||
      homeTab.layoutMode === PageLayoutTabLayoutMode.GRID;

    if (
      isCustomized ||
      !isStandardLayoutMode ||
      homeTab.widgetUniversalIdentifiers.length !== 2 ||
      isMembersWidgetEmbeddingView
    ) {
      return {
        pageLayoutTabsToUpdate: [],
        pageLayoutWidgetsToUpdate: [],
        skipReason: 'customized',
      };
    }

    return {
      pageLayoutTabsToUpdate:
        homeTab.layoutMode === PageLayoutTabLayoutMode.GRID
          ? []
          : [{ ...homeTab, layoutMode: PageLayoutTabLayoutMode.GRID }],
      pageLayoutWidgetsToUpdate: [
        {
          ...fieldsWidget,
          position: MESSAGE_LIST_GRID_LAYOUT_POSITIONS.LEFT_COLUMN,
        },
        {
          ...membersWidget,
          position: MESSAGE_LIST_GRID_LAYOUT_POSITIONS.RIGHT_COLUMN,
          configuration: {
            ...membersWidget.configuration,
            fieldDisplayMode: FieldDisplayMode.TABLE,
            viewId: membersView.id,
          },
          universalConfiguration: {
            ...membersWidget.universalConfiguration,
            fieldDisplayMode: FieldDisplayMode.TABLE,
            viewId: membersView.universalIdentifier,
          },
        },
      ],
    };
  }
}
