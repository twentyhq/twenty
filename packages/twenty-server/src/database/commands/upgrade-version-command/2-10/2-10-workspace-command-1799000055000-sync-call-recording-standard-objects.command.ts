import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildNavigationCommandMenuItemOperationsOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/build-navigation-command-menu-item-operations-or-throw.util';
import {
  buildCalendarEventFieldRenameUpdates,
  buildCallRecordingObjectRenameUpdates,
  LEGACY_CALENDAR_EVENT_RECORDING_PREFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-10/utils/call-recording-name-collision.util';
import {
  getExistingOrStandardFlatEntityOrThrow,
  getStandardFlatEntitiesToCreateOrThrow,
} from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const getUniversalIdentifiers = (
  entitiesByName: Record<string, { universalIdentifier: string }>,
): string[] =>
  Object.values(entitiesByName).map((entity) => entity.universalIdentifier);

const CALL_RECORDING_OBJECT_METADATA_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.callRecording.universalIdentifier,
];

const CALL_RECORDING_FIELD_METADATA_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.callRecording.fields),
  STANDARD_OBJECTS.calendarEvent.fields.callRecordings.universalIdentifier,
];

const CALL_RECORDING_INDEX_UNIVERSAL_IDENTIFIERS = getUniversalIdentifiers(
  STANDARD_OBJECTS.callRecording.indexes,
);

const CALL_RECORDING_VIEW_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.callRecording.views.allCallRecordings.universalIdentifier,
  STANDARD_OBJECTS.callRecording.views.callRecordingRecordPageFields
    .universalIdentifier,
];

const CALL_RECORDING_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS =
  getUniversalIdentifiers(
    STANDARD_OBJECTS.callRecording.views.callRecordingRecordPageFields
      .viewFieldGroups,
  );

const CALL_RECORDING_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.callRecording.views.allCallRecordings.viewFields,
  ),
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.callRecording.views.callRecordingRecordPageFields
      .viewFields,
  ),
];

const CALL_RECORDING_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage
    .universalIdentifier,
];

const CALL_RECORDING_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs.home
    .universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
    .timeline.universalIdentifier,
];

const CALL_RECORDING_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs.home
    .widgets.fields.universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
    .timeline.widgets.timeline.universalIdentifier,
];

// Preserves the shipped 2.10 upgrade path after recordingPreference moved out of
// current standard metadata.
const buildLegacyCalendarEventRecordingPreferenceFieldMetadata = ({
  calendarEventObjectMetadata,
  now,
  twentyStandardApplicationId,
  workspaceId,
}: {
  calendarEventObjectMetadata: FlatObjectMetadata;
  now: string;
  twentyStandardApplicationId: string;
  workspaceId: string;
}): FlatFieldMetadata<FieldMetadataType.SELECT> => ({
  id: uuidv4(),
  universalIdentifier:
    LEGACY_CALENDAR_EVENT_RECORDING_PREFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
  applicationId: twentyStandardApplicationId,
  workspaceId,
  objectMetadataId: calendarEventObjectMetadata.id,
  type: FieldMetadataType.SELECT,
  name: 'recordingPreference',
  label: 'Recording Preference',
  description:
    'Whether to record this event, applied on top of the workspace policy',
  icon: 'IconSettingsAutomation',
  isActive: true,
  isSystem: false,
  isNullable: false,
  isUnique: false,
  isUIEditable: true,
  isLabelSyncedWithName: false,
  standardOverrides: null,
  defaultValue: "'AUTO'",
  settings: null,
  options: [
    {
      id: '4c4761ce-ffbf-4176-be7f-5cf5257c8bff',
      value: 'AUTO',
      label: 'Auto',
      position: 0,
      color: 'blue',
    },
    {
      id: '1ae19135-e1a1-4a96-b866-91643622e554',
      value: 'ON',
      label: 'On',
      position: 1,
      color: 'green',
    },
    {
      id: '8c69a74f-2ab7-4c19-a813-eb0ea3533fd3',
      value: 'OFF',
      label: 'Off',
      position: 2,
      color: 'gray',
    },
  ],
  relationTargetFieldMetadataId: null,
  relationTargetObjectMetadataId: null,
  morphId: null,
  viewFieldIds: [],
  viewFilterIds: [],
  fieldPermissionIds: [],
  kanbanAggregateOperationViewIds: [],
  calendarViewIds: [],
  mainGroupByFieldMetadataViewIds: [],
  createdAt: now,
  updatedAt: now,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier:
    STANDARD_OBJECTS.calendarEvent.universalIdentifier,
  relationTargetObjectMetadataUniversalIdentifier: null,
  relationTargetFieldMetadataUniversalIdentifier: null,
  viewFilterUniversalIdentifiers: [],
  viewFieldUniversalIdentifiers: [],
  fieldPermissionUniversalIdentifiers: [],
  kanbanAggregateOperationViewUniversalIdentifiers: [],
  calendarViewUniversalIdentifiers: [],
  mainGroupByFieldMetadataViewUniversalIdentifiers: [],
  viewSortIds: [],
  viewSortUniversalIdentifiers: [],
  universalSettings: null,
});

@RegisteredWorkspaceCommand('2.10.0', 1799000055000)
@Command({
  name: 'upgrade:2-10:sync-call-recording-standard-objects',
  description:
    'Create the CallRecording standard metadata in existing workspaces',
})
export class SyncCallRecordingStandardObjectsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
      flatIndexMaps,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
      flatCommandMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
      'flatCommandMenuItemMaps',
    ]);

    const calendarEventObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.calendarEvent.universalIdentifier
      ];

    if (!isDefined(calendarEventObjectMetadata)) {
      this.logger.warn(
        `calendarEvent object not found for workspace ${workspaceId}, skipping CallRecording standard metadata sync`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now,
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const objectMetadataRenameUpdates = buildCallRecordingObjectRenameUpdates({
      flatObjectMetadataMaps,
      now,
    });
    const fieldMetadataRenameUpdates = buildCalendarEventFieldRenameUpdates({
      flatFieldMetadataMaps,
      now,
    });
    const renamedCollisionObjectMetadatas = objectMetadataRenameUpdates.map(
      (objectMetadata) => ({
        universalIdentifier: objectMetadata.universalIdentifier,
        nameSingular: objectMetadata.nameSingular,
      }),
    );

    const callRecordingObjectMetadataForNavigation =
      getExistingOrStandardFlatEntityOrThrow<FlatObjectMetadata>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatObjectMetadataMaps,
        existingFlatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
      });

    const navigationCommandMenuItemOperations =
      buildNavigationCommandMenuItemOperationsOrThrow({
        existingFlatCommandMenuItemMaps: flatCommandMenuItemMaps,
        objectMetadatasForNavigation: [
          callRecordingObjectMetadataForNavigation,
        ],
        applicationId: twentyStandardFlatApplication.id,
        workspaceId,
        now,
        renamedCollisionObjectMetadatas,
      });

    const legacyCalendarEventRecordingPreferenceFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        LEGACY_CALENDAR_EVENT_RECORDING_PREFERENCE_FIELD_UNIVERSAL_IDENTIFIER
      ];
    const legacyCalendarEventRecordingPreferenceFieldMetadataToCreate =
      isDefined(legacyCalendarEventRecordingPreferenceFieldMetadata)
        ? []
        : [
            buildLegacyCalendarEventRecordingPreferenceFieldMetadata({
              calendarEventObjectMetadata,
              now,
              twentyStandardApplicationId: twentyStandardFlatApplication.id,
              workspaceId,
            }),
          ];

    const allFlatEntityOperationByMetadataName = {
      objectMetadata: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatObjectMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatObjectMetadataMaps,
            existingFlatEntityMaps: flatObjectMetadataMaps,
            universalIdentifiers:
              CALL_RECORDING_OBJECT_METADATA_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      fieldMetadata: {
        flatEntityToCreate: [
          ...getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatFieldMetadataMaps,
            existingFlatEntityMaps: flatFieldMetadataMaps,
            universalIdentifiers:
              CALL_RECORDING_FIELD_METADATA_UNIVERSAL_IDENTIFIERS,
          }),
          ...legacyCalendarEventRecordingPreferenceFieldMetadataToCreate,
        ],
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      index: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
            existingFlatEntityMaps: flatIndexMaps,
            universalIdentifiers: CALL_RECORDING_INDEX_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      view: {
        flatEntityToCreate: getStandardFlatEntitiesToCreateOrThrow<FlatView>({
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
          existingFlatEntityMaps: flatViewMaps,
          universalIdentifiers: CALL_RECORDING_VIEW_UNIVERSAL_IDENTIFIERS,
        }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      viewFieldGroup: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatViewFieldGroup>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatViewFieldGroupMaps,
            existingFlatEntityMaps: flatViewFieldGroupMaps,
            universalIdentifiers:
              CALL_RECORDING_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      viewField: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
            existingFlatEntityMaps: flatViewFieldMaps,
            universalIdentifiers:
              CALL_RECORDING_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      pageLayout: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatPageLayout>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatPageLayoutMaps,
            existingFlatEntityMaps: flatPageLayoutMaps,
            universalIdentifiers:
              CALL_RECORDING_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      pageLayoutTab: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutTab>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatPageLayoutTabMaps,
            existingFlatEntityMaps: flatPageLayoutTabMaps,
            universalIdentifiers:
              CALL_RECORDING_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      pageLayoutWidget: {
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
            existingFlatEntityMaps: flatPageLayoutWidgetMaps,
            universalIdentifiers:
              CALL_RECORDING_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS,
          }),
        flatEntityToDelete: [],
        flatEntityToUpdate: [],
      },
      commandMenuItem: navigationCommandMenuItemOperations,
    };

    const totalOperationCount =
      objectMetadataRenameUpdates.length +
      fieldMetadataRenameUpdates.length +
      Object.values(allFlatEntityOperationByMetadataName).reduce(
        (total, operations) =>
          total +
          operations.flatEntityToCreate.length +
          operations.flatEntityToUpdate.length,
        0,
      );

    if (totalOperationCount === 0) {
      this.logger.log(
        `CallRecording standard metadata already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      if (objectMetadataRenameUpdates.length > 0) {
        this.logger.log(
          `[DRY RUN] Would rename ${objectMetadataRenameUpdates.length} CallRecording object name collision(s) for workspace ${workspaceId}`,
        );
      }

      if (fieldMetadataRenameUpdates.length > 0) {
        this.logger.log(
          `[DRY RUN] Would rename ${fieldMetadataRenameUpdates.length} calendarEvent field name collision(s) for workspace ${workspaceId}`,
        );
      }

      this.logger.log(
        `[DRY RUN] Would apply ${totalOperationCount} CallRecording standard metadata operations for workspace ${workspaceId}`,
      );

      return;
    }

    // Renames must commit before the create: a combined create + rename
    // migration trips the namePlural unique index.
    const collisionRenameMigrations = [
      ...objectMetadataRenameUpdates.map((flatObjectMetadata) => ({
        applicationUniversalIdentifier:
          flatObjectMetadata.applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          objectMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [flatObjectMetadata],
          },
        },
      })),
      ...fieldMetadataRenameUpdates.map((flatFieldMetadata) => ({
        applicationUniversalIdentifier:
          flatFieldMetadata.applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          fieldMetadata: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: [flatFieldMetadata],
          },
        },
      })),
    ];

    // Collisions can belong to different applications, so each rename runs as
    // its own migration scoped to the colliding entity's application.
    for (const {
      applicationUniversalIdentifier,
      allFlatEntityOperationByMetadataName,
    } of collisionRenameMigrations) {
      const renameResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            applicationUniversalIdentifier,
            workspaceId,
            allFlatEntityOperationByMetadataName,
          },
        );

      if (renameResult.status === 'fail') {
        throw new Error(
          `Failed to rename CallRecording name collision for workspace ${workspaceId}: ${JSON.stringify(
            renameResult,
            null,
            2,
          )}`,
        );
      }
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to create CallRecording standard objects for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Applied ${totalOperationCount} CallRecording standard metadata operations for workspace ${workspaceId}`,
    );
  }
}
