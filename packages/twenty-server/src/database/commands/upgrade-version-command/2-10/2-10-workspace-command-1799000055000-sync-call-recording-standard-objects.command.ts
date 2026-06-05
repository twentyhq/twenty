import { Command } from 'nest-commander';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildNavigationCommandMenuItemOperationsOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/build-navigation-command-menu-item-operations-or-throw.util';
import {
  buildCalendarEventFieldRenameUpdates,
  buildCallRecordingObjectRenameUpdates,
} from 'src/database/commands/upgrade-version-command/2-10/utils/call-recording-name-collision.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
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
import { type FromToAllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { computeUniversalFlatEntityMapsFromToThroughMutation } from 'src/engine/workspace-manager/workspace-migration/utils/compute-universal-flat-entity-maps-from-to-through-mutation.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-universal-flat-entity-by-universal-identifiers-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';

const getUniversalIdentifiers = (
  entitiesByName: Record<string, { universalIdentifier: string }>,
): string[] =>
  Object.values(entitiesByName).map((entity) => entity.universalIdentifier);

const buildExistingFlatEntityMapsByUniversalIdentifiers = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  universalIdentifiers,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  universalIdentifiers: readonly string[];
}): FlatEntityMaps<T> => {
  const subFlatEntityMaps = createEmptyFlatEntityMaps() as FlatEntityMaps<T>;

  for (const universalIdentifier of universalIdentifiers) {
    const flatEntity = flatEntityMaps.byUniversalIdentifier[universalIdentifier];

    if (!isDefined(flatEntity)) {
      continue;
    }

    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity,
      flatEntityMapsToMutate: subFlatEntityMaps,
    });
  }

  return subFlatEntityMaps;
};

const buildScopedStandardFromToFlatEntityMaps = <
  T extends SyncableFlatEntity,
>({
  existingFlatEntityMaps,
  standardFlatEntityMaps,
  universalIdentifiers,
}: {
  existingFlatEntityMaps: FlatEntityMaps<T>;
  standardFlatEntityMaps: FlatEntityMaps<T>;
  universalIdentifiers: readonly string[];
}) => ({
  from: buildExistingFlatEntityMapsByUniversalIdentifiers<T>({
    flatEntityMaps: existingFlatEntityMaps,
    universalIdentifiers,
  }),
  to: getSubUniversalFlatEntityByUniversalIdentifiersMapsOrThrow<T>({
    universalFlatEntityMaps: standardFlatEntityMaps,
    universalIdentifiers: [...universalIdentifiers],
  }),
});

const CALL_RECORDING_OBJECT_METADATA_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.callRecording.universalIdentifier,
];

const CALL_RECORDING_FIELD_METADATA_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.callRecording.fields),
  STANDARD_OBJECTS.calendarEvent.fields.recordingPreference.universalIdentifier,
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

const CALL_RECORDING_SYNC_CACHE_KEYS = [
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
  'featureFlagsMap',
] as const;

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
      featureFlagsMap,
    } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      CALL_RECORDING_SYNC_CACHE_KEYS,
    );

    const calendarEventObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.calendarEvent.universalIdentifier
      ];

    if (!isDefined(calendarEventObjectMetadata)) {
      throw new Error(
        `calendarEvent object not found for workspace ${workspaceId}`,
      );
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();

    const {
      allFlatEntityMaps: standardAllFlatEntityMaps,
      idByUniversalIdentifierByMetadataName,
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
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
        `[DRY RUN] Would sync CallRecording standard metadata for workspace ${workspaceId}`,
      );

      return;
    }

    // Renames must commit before the create: a combined create + rename
    // migration trips the namePlural unique index.
    if (
      objectMetadataRenameUpdates.length > 0 ||
      fieldMetadataRenameUpdates.length > 0
    ) {
      const renameResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
            workspaceId,
            allFlatEntityOperationByMetadataName: {
              objectMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: objectMetadataRenameUpdates,
              },
              fieldMetadata: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: fieldMetadataRenameUpdates,
              },
            },
          },
        );

      if (renameResult.status === 'fail') {
        throw new Error(
          `Failed to rename CallRecording name collisions for workspace ${workspaceId}: ${JSON.stringify(
            renameResult,
            null,
            2,
          )}`,
        );
      }

      ({
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
        featureFlagsMap,
      } = await this.workspaceCacheService.getOrRecompute(
        workspaceId,
        CALL_RECORDING_SYNC_CACHE_KEYS,
      ));
    }

    const standardCallRecordingObjectMetadata =
      findFlatEntityByUniversalIdentifierOrThrow<FlatObjectMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
      });

    const callRecordingObjectMetadataForNavigation =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.callRecording.universalIdentifier
      ] ?? standardCallRecordingObjectMetadata;

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

    const fromToAllFlatEntityMaps: FromToAllUniversalFlatEntityMaps = {
      flatObjectMetadataMaps:
        buildScopedStandardFromToFlatEntityMaps<FlatObjectMetadata>({
          existingFlatEntityMaps: flatObjectMetadataMaps,
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatObjectMetadataMaps,
          universalIdentifiers:
            CALL_RECORDING_OBJECT_METADATA_UNIVERSAL_IDENTIFIERS,
        }),
      flatFieldMetadataMaps:
        buildScopedStandardFromToFlatEntityMaps<FlatFieldMetadata>({
          existingFlatEntityMaps: flatFieldMetadataMaps,
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
          universalIdentifiers:
            CALL_RECORDING_FIELD_METADATA_UNIVERSAL_IDENTIFIERS,
        }),
      flatIndexMaps: buildScopedStandardFromToFlatEntityMaps<FlatIndexMetadata>({
        existingFlatEntityMaps: flatIndexMaps,
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        universalIdentifiers: CALL_RECORDING_INDEX_UNIVERSAL_IDENTIFIERS,
      }),
      flatViewMaps: buildScopedStandardFromToFlatEntityMaps<FlatView>({
        existingFlatEntityMaps: flatViewMaps,
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewMaps,
        universalIdentifiers: CALL_RECORDING_VIEW_UNIVERSAL_IDENTIFIERS,
      }),
      flatViewFieldGroupMaps:
        buildScopedStandardFromToFlatEntityMaps<FlatViewFieldGroup>({
          existingFlatEntityMaps: flatViewFieldGroupMaps,
          standardFlatEntityMaps:
            standardAllFlatEntityMaps.flatViewFieldGroupMaps,
          universalIdentifiers:
            CALL_RECORDING_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS,
        }),
      flatViewFieldMaps:
        buildScopedStandardFromToFlatEntityMaps<FlatViewField>({
          existingFlatEntityMaps: flatViewFieldMaps,
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
          universalIdentifiers: CALL_RECORDING_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
        }),
      flatPageLayoutMaps:
        buildScopedStandardFromToFlatEntityMaps<FlatPageLayout>({
          existingFlatEntityMaps: flatPageLayoutMaps,
          standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutMaps,
          universalIdentifiers: CALL_RECORDING_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
        }),
      flatPageLayoutTabMaps:
        buildScopedStandardFromToFlatEntityMaps<FlatPageLayoutTab>({
          existingFlatEntityMaps: flatPageLayoutTabMaps,
          standardFlatEntityMaps:
            standardAllFlatEntityMaps.flatPageLayoutTabMaps,
          universalIdentifiers:
            CALL_RECORDING_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS,
        }),
      flatPageLayoutWidgetMaps:
        buildScopedStandardFromToFlatEntityMaps<FlatPageLayoutWidget>({
          existingFlatEntityMaps: flatPageLayoutWidgetMaps,
          standardFlatEntityMaps:
            standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
          universalIdentifiers:
            CALL_RECORDING_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS,
        }),
      flatCommandMenuItemMaps:
        computeUniversalFlatEntityMapsFromToThroughMutation<'commandMenuItem'>({
          flatEntityMaps: structuredClone(flatCommandMenuItemMaps),
          ...navigationCommandMenuItemOperations,
        }),
    };

    const dependencyAllFlatEntityMaps = {
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
    } satisfies Partial<AllUniversalFlatEntityMaps>;

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          buildOptions: {
            isSystemBuild: true,
            inferDeletionFromMissingEntities: false,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
          fromToAllFlatEntityMaps,
          workspaceId,
          additionalCacheDataMaps: {
            featureFlagsMap,
          },
          dependencyAllFlatEntityMaps,
          idByUniversalIdentifierByMetadataName,
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

    const appliedOperationCount =
      objectMetadataRenameUpdates.length +
      fieldMetadataRenameUpdates.length +
      validateAndBuildResult.workspaceMigration.actions.length;

    if (appliedOperationCount === 0) {
      this.logger.log(
        `CallRecording standard metadata already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `Applied ${appliedOperationCount} CallRecording standard metadata operations for workspace ${workspaceId}`,
    );
  }
}
