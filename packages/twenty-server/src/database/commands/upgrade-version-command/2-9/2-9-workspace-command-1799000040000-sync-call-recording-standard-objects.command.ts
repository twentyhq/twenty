import { Command } from 'nest-commander';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildNavigationCommandMenuItemOperationsOrThrow } from 'src/database/commands/upgrade-version-command/2-9/utils/build-navigation-command-menu-item-operations-or-throw.util';
import {
  findCollidingCustomCallRecordingObjects,
  resolveAvailableOldNames,
} from 'src/database/commands/upgrade-version-command/2-9/utils/call-recording-name-collision.util';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-9/utils/get-standard-flat-entities-to-create-or-throw.util';
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
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
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
  STANDARD_OBJECTS.calendarEvent.fields.recordingPreference.universalIdentifier,
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

@RegisteredWorkspaceCommand('2.9.0', 1799000040000)
@Command({
  name: 'upgrade:2-9:sync-call-recording-standard-objects',
  description:
    'Create the CallRecording standard metadata in existing workspaces',
})
export class SyncCallRecordingStandardObjectsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly objectMetadataService: ObjectMetadataService,
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

    let {
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

    const renamedCollisionObjectMetadatas: {
      universalIdentifier: string;
      nameSingular: string;
    }[] = [];

    const collidingCustomObjects = findCollidingCustomCallRecordingObjects(
      flatObjectMetadataMaps,
    );

    // Each rename consumes a callRecordingOld name; reserve assigned names so the
    // next colliding object falls back to callRecordingOld2, callRecordingOld3, etc.
    const reservedOldNames = new Set<string>();

    for (const collidingCustomObject of collidingCustomObjects) {
      const { nameSingular, namePlural, labelSingular, labelPlural } =
        resolveAvailableOldNames(flatObjectMetadataMaps, reservedOldNames);

      reservedOldNames.add(nameSingular);
      reservedOldNames.add(namePlural);

      if (isDryRun) {
        this.logger.log(
          `[DRY RUN] Would rename colliding custom object (${collidingCustomObject.nameSingular}) to '${nameSingular}' for workspace ${workspaceId}`,
        );
        continue;
      }

      await this.objectMetadataService.updateOneObject({
        workspaceId,
        updateObjectInput: {
          id: collidingCustomObject.id,
          update: {
            nameSingular,
            namePlural,
            labelSingular,
            labelPlural,
            isLabelSyncedWithName: false,
          },
        },
      });

      this.logger.log(
        `Renamed colliding custom object to '${nameSingular}' for workspace ${workspaceId}`,
      );

      renamedCollisionObjectMetadatas.push({
        universalIdentifier: collidingCustomObject.universalIdentifier,
        nameSingular,
      });
    }

    if (renamedCollisionObjectMetadatas.length > 0) {
      ({ flatObjectMetadataMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
        ]));
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

    // CallRecording is not in the workspace yet — navigation reads it from the standard maps it will be created from.
    const navigationCommandMenuItemOperations =
      buildNavigationCommandMenuItemOperationsOrThrow({
        existingFlatCommandMenuItemMaps: flatCommandMenuItemMaps,
        flatObjectMetadataMaps: standardAllFlatEntityMaps.flatObjectMetadataMaps,
        objectMetadataUniversalIdentifiers:
          CALL_RECORDING_OBJECT_METADATA_UNIVERSAL_IDENTIFIERS,
        applicationId: twentyStandardFlatApplication.id,
        workspaceId,
        now,
        renamedCollisionObjectMetadatas,
      });

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
        flatEntityToCreate:
          getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
            standardFlatEntityMaps:
              standardAllFlatEntityMaps.flatFieldMetadataMaps,
            existingFlatEntityMaps: flatFieldMetadataMaps,
            universalIdentifiers:
              CALL_RECORDING_FIELD_METADATA_UNIVERSAL_IDENTIFIERS,
          }),
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
            standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutMaps,
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

    const totalOperationCount = Object.values(
      allFlatEntityOperationByMetadataName,
    ).reduce(
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
      this.logger.log(
        `[DRY RUN] Would apply ${totalOperationCount} CallRecording standard metadata operations for workspace ${workspaceId}`,
      );

      return;
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
