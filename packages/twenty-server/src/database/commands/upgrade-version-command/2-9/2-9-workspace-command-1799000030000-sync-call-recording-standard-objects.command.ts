import { Command } from 'nest-commander';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { v4, v5 } from 'uuid';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  findCollidingCustomCallRecordingObject,
  resolveAvailableOldNames,
} from 'src/database/commands/upgrade-version-command/2-9/utils/call-recording-name-collision.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-ids-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import {
  buildNavigationConditionalAvailabilityExpression,
  buildNavigationFlatCommandMenuItem,
  NAVIGATION_COMMAND_UUID_NAMESPACE,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
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
  STANDARD_OBJECTS.callRecordingCalendarEventAssociation.universalIdentifier,
];

const CALL_RECORDING_FIELD_METADATA_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.callRecording.fields),
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.callRecordingCalendarEventAssociation.fields,
  ),
  STANDARD_OBJECTS.calendarEvent.fields.callRecordingCalendarEventAssociations
    .universalIdentifier,
];

const CALL_RECORDING_INDEX_UNIVERSAL_IDENTIFIERS = [
  ...getUniversalIdentifiers(STANDARD_OBJECTS.callRecording.indexes),
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.callRecordingCalendarEventAssociation.indexes,
  ),
];

const CALL_RECORDING_VIEW_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.callRecording.views.allCallRecordings.universalIdentifier,
  STANDARD_OBJECTS.callRecording.views.callRecordingRecordPageFields
    .universalIdentifier,
  STANDARD_OBJECTS.callRecordingCalendarEventAssociation.views
    .allCallRecordingCalendarEventAssociations.universalIdentifier,
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
  ...getUniversalIdentifiers(
    STANDARD_OBJECTS.callRecordingCalendarEventAssociation.views
      .allCallRecordingCalendarEventAssociations.viewFields,
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

@RegisteredWorkspaceCommand('2.9.0', 1799000030000)
@Command({
  name: 'upgrade:2-9:sync-call-recording-standard-objects',
  description:
    'Create the CallRecording and CallRecordingCalendarEventAssociation standard metadata in existing workspaces',
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

  private addNewEntitiesToFlatEntityMaps<T extends SyncableFlatEntity>({
    fromMaps,
    standardBuilderMaps,
    universalIdentifiers,
  }: {
    fromMaps: FlatEntityMaps<T>;
    standardBuilderMaps: FlatEntityMaps<T>;
    universalIdentifiers: string[];
  }): FlatEntityMaps<T> {
    let toMaps = fromMaps;

    for (const universalIdentifier of universalIdentifiers) {
      const entity =
        standardBuilderMaps.byUniversalIdentifier[universalIdentifier];

      if (!isDefined(entity)) {
        throw new Error(
          `Could not find standard entity ${universalIdentifier}`,
        );
      }

      if (isDefined(fromMaps.byUniversalIdentifier[universalIdentifier])) {
        continue;
      }

      toMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: entity,
        flatEntityMaps: toMaps,
      });
    }

    return toMaps;
  }

  private addNavigationCommandMenuItemsToFlatEntityMaps({
    fromMaps,
    flatObjectMetadataMaps,
    applicationId,
    workspaceId,
    now,
    renamedCollisionObjectMetadata,
  }: {
    fromMaps: FlatEntityMaps<FlatCommandMenuItem>;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    applicationId: string;
    workspaceId: string;
    now: string;
    renamedCollisionObjectMetadata?: {
      universalIdentifier: string;
      nameSingular: string;
    };
  }): FlatEntityMaps<FlatCommandMenuItem> {
    let toMaps = fromMaps;
    let nextPosition =
      Object.values(toMaps.byUniversalIdentifier)
        .filter(isDefined)
        .reduce(
          (maxPosition, commandMenuItem) =>
            Math.max(maxPosition, commandMenuItem.position),
          -1,
        ) + 1;

    for (const objectMetadataUniversalIdentifier of CALL_RECORDING_OBJECT_METADATA_UNIVERSAL_IDENTIFIERS) {
      const objectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          objectMetadataUniversalIdentifier
        ];

      if (!isDefined(objectMetadata)) {
        throw new Error(
          `Could not find object metadata ${objectMetadataUniversalIdentifier}`,
        );
      }

      const commandMenuItemUniversalIdentifier = v5(
        objectMetadata.universalIdentifier,
        NAVIGATION_COMMAND_UUID_NAMESPACE,
      );

      if (
        !objectMetadata.isActive ||
        isDefined(
          fromMaps.byUniversalIdentifier[commandMenuItemUniversalIdentifier],
        )
      ) {
        continue;
      }

      toMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: buildNavigationFlatCommandMenuItem({
          objectMetadata,
          commandMenuItemId: v4(),
          applicationId,
          workspaceId,
          position: nextPosition++,
          now,
        }),
        flatEntityMaps: toMaps,
      });
    }

    if (isDefined(renamedCollisionObjectMetadata)) {
      const renamedNavigationCommandMenuItemUniversalIdentifier = v5(
        renamedCollisionObjectMetadata.universalIdentifier,
        NAVIGATION_COMMAND_UUID_NAMESPACE,
      );
      const staleNavigationCommandMenuItem =
        toMaps.byUniversalIdentifier[
          renamedNavigationCommandMenuItemUniversalIdentifier
        ];

      if (isDefined(staleNavigationCommandMenuItem)) {
        toMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
          flatEntity: {
            ...staleNavigationCommandMenuItem,
            conditionalAvailabilityExpression:
              buildNavigationConditionalAvailabilityExpression({
                universalIdentifier:
                  renamedCollisionObjectMetadata.universalIdentifier,
                nameSingular: renamedCollisionObjectMetadata.nameSingular,
              }),
            updatedAt: now,
          },
          flatEntityMaps: toMaps,
        });
      }
    }

    return toMaps;
  }

  private countNewEntities<T extends SyncableFlatEntity>({
    fromMaps,
    toMaps,
  }: {
    fromMaps: FlatEntityMaps<T>;
    toMaps: FlatEntityMaps<T>;
  }): number {
    return Object.entries(toMaps.byUniversalIdentifier).filter(
      ([universalIdentifier, entity]) =>
        isDefined(entity) &&
        !isDefined(fromMaps.byUniversalIdentifier[universalIdentifier]),
    ).length;
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
      'featureFlagsMap',
    ]);

    let renamedCollisionObjectMetadata:
      | { universalIdentifier: string; nameSingular: string }
      | undefined;

    const collidingCustomObject = findCollidingCustomCallRecordingObject(
      flatObjectMetadataMaps,
    );

    if (isDefined(collidingCustomObject)) {
      const { nameSingular, namePlural, labelSingular, labelPlural } =
        resolveAvailableOldNames(flatObjectMetadataMaps);

      if (isDryRun) {
        this.logger.log(
          `[DRY RUN] Would rename colliding custom object (${collidingCustomObject.nameSingular}) to '${nameSingular}' for workspace ${workspaceId}`,
        );
      } else {
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

        renamedCollisionObjectMetadata = {
          universalIdentifier: collidingCustomObject.universalIdentifier,
          nameSingular,
        };

        ({ flatObjectMetadataMaps } =
          await this.workspaceCacheService.getOrRecompute(workspaceId, [
            'flatObjectMetadataMaps',
          ]));
      }
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const fromFlatObjectMetadataMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatObjectMetadata>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatObjectMetadataMaps,
      });

    const fromFlatFieldMetadataMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatFieldMetadata>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatFieldMetadataMaps,
      });

    const fromFlatIndexMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatIndexMetadata>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatIndexMaps,
      });

    const fromFlatViewMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatView>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatViewMaps,
      });

    const fromFlatViewFieldGroupMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatViewFieldGroup>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatViewFieldGroupMaps,
      });

    const fromFlatViewFieldMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatViewField>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatViewFieldMaps,
      });

    const fromFlatPageLayoutMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatPageLayout>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatPageLayoutMaps,
      });

    const fromFlatPageLayoutTabMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatPageLayoutTab>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatPageLayoutTabMaps,
      });

    const fromFlatPageLayoutWidgetMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatPageLayoutWidget>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatPageLayoutWidgetMaps,
      });

    const fromFlatCommandMenuItemMaps =
      getSubFlatEntityMapsByApplicationIdsOrThrow<FlatCommandMenuItem>({
        applicationIds: [twentyStandardFlatApplication.id],
        flatEntityMaps: flatCommandMenuItemMaps,
      });

    const now = new Date().toISOString();

    const {
      allFlatEntityMaps: standardAllFlatEntityMaps,
      idByUniversalIdentifierByMetadataName,
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now,
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });

    const toFlatObjectMetadataMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatObjectMetadata>({
        fromMaps: fromFlatObjectMetadataMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatObjectMetadataMaps,
        universalIdentifiers:
          CALL_RECORDING_OBJECT_METADATA_UNIVERSAL_IDENTIFIERS,
      });

    const toFlatFieldMetadataMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatFieldMetadata>({
        fromMaps: fromFlatFieldMetadataMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifiers:
          CALL_RECORDING_FIELD_METADATA_UNIVERSAL_IDENTIFIERS,
      });

    const toFlatIndexMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatIndexMetadata>({
        fromMaps: fromFlatIndexMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatIndexMaps,
        universalIdentifiers: CALL_RECORDING_INDEX_UNIVERSAL_IDENTIFIERS,
      });

    const toFlatViewMaps = this.addNewEntitiesToFlatEntityMaps<FlatView>({
      fromMaps: fromFlatViewMaps,
      standardBuilderMaps: standardAllFlatEntityMaps.flatViewMaps,
      universalIdentifiers: CALL_RECORDING_VIEW_UNIVERSAL_IDENTIFIERS,
    });

    const toFlatViewFieldGroupMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatViewFieldGroup>({
        fromMaps: fromFlatViewFieldGroupMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatViewFieldGroupMaps,
        universalIdentifiers:
          CALL_RECORDING_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS,
      });

    const toFlatViewFieldMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatViewField>({
        fromMaps: fromFlatViewFieldMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
        universalIdentifiers: CALL_RECORDING_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      });

    const toFlatPageLayoutMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatPageLayout>({
        fromMaps: fromFlatPageLayoutMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatPageLayoutMaps,
        universalIdentifiers: CALL_RECORDING_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
      });

    const toFlatPageLayoutTabMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatPageLayoutTab>({
        fromMaps: fromFlatPageLayoutTabMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatPageLayoutTabMaps,
        universalIdentifiers:
          CALL_RECORDING_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS,
      });

    const toFlatPageLayoutWidgetMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatPageLayoutWidget>({
        fromMaps: fromFlatPageLayoutWidgetMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
        universalIdentifiers:
          CALL_RECORDING_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS,
      });

    const toFlatCommandMenuItemMaps =
      this.addNavigationCommandMenuItemsToFlatEntityMaps({
        fromMaps: fromFlatCommandMenuItemMaps,
        flatObjectMetadataMaps: toFlatObjectMetadataMaps,
        applicationId: twentyStandardFlatApplication.id,
        workspaceId,
        now,
        renamedCollisionObjectMetadata,
      });

    const newEntityCount = [
      this.countNewEntities({
        fromMaps: fromFlatObjectMetadataMaps,
        toMaps: toFlatObjectMetadataMaps,
      }),
      this.countNewEntities({
        fromMaps: fromFlatFieldMetadataMaps,
        toMaps: toFlatFieldMetadataMaps,
      }),
      this.countNewEntities({
        fromMaps: fromFlatIndexMaps,
        toMaps: toFlatIndexMaps,
      }),
      this.countNewEntities({
        fromMaps: fromFlatViewMaps,
        toMaps: toFlatViewMaps,
      }),
      this.countNewEntities({
        fromMaps: fromFlatViewFieldGroupMaps,
        toMaps: toFlatViewFieldGroupMaps,
      }),
      this.countNewEntities({
        fromMaps: fromFlatViewFieldMaps,
        toMaps: toFlatViewFieldMaps,
      }),
      this.countNewEntities({
        fromMaps: fromFlatPageLayoutMaps,
        toMaps: toFlatPageLayoutMaps,
      }),
      this.countNewEntities({
        fromMaps: fromFlatPageLayoutTabMaps,
        toMaps: toFlatPageLayoutTabMaps,
      }),
      this.countNewEntities({
        fromMaps: fromFlatPageLayoutWidgetMaps,
        toMaps: toFlatPageLayoutWidgetMaps,
      }),
      this.countNewEntities({
        fromMaps: fromFlatCommandMenuItemMaps,
        toMaps: toFlatCommandMenuItemMaps,
      }),
    ].reduce((total, count) => total + count, 0);

    if (newEntityCount === 0) {
      this.logger.log(
        `CallRecording standard metadata already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${newEntityCount} CallRecording standard metadata entities for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          buildOptions: {
            isSystemBuild: true,
            inferDeletionFromMissingEntities: true,
            applicationUniversalIdentifier:
              twentyStandardFlatApplication.universalIdentifier,
          },
          fromToAllFlatEntityMaps: {
            flatObjectMetadataMaps: {
              from: fromFlatObjectMetadataMaps,
              to: toFlatObjectMetadataMaps,
            },
            flatFieldMetadataMaps: {
              from: fromFlatFieldMetadataMaps,
              to: toFlatFieldMetadataMaps,
            },
            flatIndexMaps: {
              from: fromFlatIndexMaps,
              to: toFlatIndexMaps,
            },
            flatViewMaps: {
              from: fromFlatViewMaps,
              to: toFlatViewMaps,
            },
            flatViewFieldGroupMaps: {
              from: fromFlatViewFieldGroupMaps,
              to: toFlatViewFieldGroupMaps,
            },
            flatViewFieldMaps: {
              from: fromFlatViewFieldMaps,
              to: toFlatViewFieldMaps,
            },
            flatPageLayoutMaps: {
              from: fromFlatPageLayoutMaps,
              to: toFlatPageLayoutMaps,
            },
            flatPageLayoutTabMaps: {
              from: fromFlatPageLayoutTabMaps,
              to: toFlatPageLayoutTabMaps,
            },
            flatPageLayoutWidgetMaps: {
              from: fromFlatPageLayoutWidgetMaps,
              to: toFlatPageLayoutWidgetMaps,
            },
            flatCommandMenuItemMaps: {
              from: fromFlatCommandMenuItemMaps,
              to: toFlatCommandMenuItemMaps,
            },
          },
          workspaceId,
          additionalCacheDataMaps: {
            featureFlagsMap,
          },
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

    this.logger.log(
      `Created ${newEntityCount} CallRecording standard metadata entities for workspace ${workspaceId}`,
    );
  }
}
