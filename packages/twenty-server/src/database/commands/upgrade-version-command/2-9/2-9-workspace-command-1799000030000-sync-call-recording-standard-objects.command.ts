import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getSubFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-ids-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALL_RECORDING_NAME_SINGULAR = 'callRecording';
const CALL_RECORDING_NAME_PLURAL = 'callRecordings';
const CALL_RECORDING_OLD_NAME_SINGULAR = 'callRecordingOld';
const CALL_RECORDING_OLD_NAME_PLURAL = 'callRecordingsOld';
const MAX_OLD_NAME_ATTEMPTS = 100;

@RegisteredWorkspaceCommand('2.9.0', 1799000030000)
@Command({
  name: 'upgrade:2-9:sync-call-recording-standard-objects',
  description:
    'Create the CallRecording and CallRecordingCalendarEventAssociation standard objects, fields and indexes in existing workspaces',
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

  // Add only the standard entities the workspace is missing, leaving everything else untouched (add-only, no deletions).
  private addNewEntitiesToFlatEntityMaps<T extends SyncableFlatEntity>({
    fromMaps,
    standardBuilderMaps,
  }: {
    fromMaps: FlatEntityMaps<T>;
    standardBuilderMaps: FlatEntityMaps<T>;
  }): FlatEntityMaps<T> {
    let toMaps = fromMaps;

    for (const [universalIdentifier, entity] of Object.entries(
      standardBuilderMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(entity) ||
        isDefined(fromMaps.byUniversalIdentifier[universalIdentifier])
      ) {
        continue;
      }

      toMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: entity,
        flatEntityMaps: toMaps,
      });
    }

    return toMaps;
  }

  private findCollidingCustomCallRecordingObject(
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  ): FlatObjectMetadata | undefined {
    return Object.values(flatObjectMetadataMaps.byUniversalIdentifier).find(
      (flatObjectMetadata): flatObjectMetadata is FlatObjectMetadata =>
        isDefined(flatObjectMetadata) &&
        flatObjectMetadata.universalIdentifier !==
          STANDARD_OBJECTS.callRecording.universalIdentifier &&
        [flatObjectMetadata.nameSingular, flatObjectMetadata.namePlural].some(
          (name) =>
            name === CALL_RECORDING_NAME_SINGULAR ||
            name === CALL_RECORDING_NAME_PLURAL,
        ),
    );
  }

  // Pick the first callRecordingOld/callRecordingsOld pair not already taken, so the rename can't hit the unique-name constraint.
  private resolveAvailableOldNames(
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  ): {
    nameSingular: string;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
  } {
    const takenNames = new Set(
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .flatMap((flatObjectMetadata) => [
          flatObjectMetadata.nameSingular,
          flatObjectMetadata.namePlural,
        ]),
    );

    for (let attempt = 0; attempt < MAX_OLD_NAME_ATTEMPTS; attempt++) {
      const discriminator = attempt === 0 ? '' : `${attempt + 1}`;
      const nameSingular = `${CALL_RECORDING_OLD_NAME_SINGULAR}${discriminator}`;
      const namePlural = `${CALL_RECORDING_OLD_NAME_PLURAL}${discriminator}`;

      if (!takenNames.has(nameSingular) && !takenNames.has(namePlural)) {
        const labelSuffix = discriminator === '' ? '' : ` ${discriminator}`;

        return {
          nameSingular,
          namePlural,
          labelSingular: `Call Recording (Old)${labelSuffix}`,
          labelPlural: `Call Recordings (Old)${labelSuffix}`,
        };
      }
    }

    throw new Error(
      `Could not find an available callRecordingOld name after ${MAX_OLD_NAME_ATTEMPTS} attempts`,
    );
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
      featureFlagsMap,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'featureFlagsMap',
    ]);

    const standardObjectExists = (universalIdentifier: string): boolean =>
      isDefined(
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier,
        }),
      );

    // Skip only when BOTH standard objects are present; a partial prior run must still add whichever one is missing.
    if (
      standardObjectExists(STANDARD_OBJECTS.callRecording.universalIdentifier) &&
      standardObjectExists(
        STANDARD_OBJECTS.callRecordingCalendarEventAssociation
          .universalIdentifier,
      )
    ) {
      this.logger.log(
        `CallRecording standard objects already exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    // A self-hosted workspace may already have a custom object named callRecording; rename it aside so the standard name is free.
    const collidingCustomObject =
      this.findCollidingCustomCallRecordingObject(flatObjectMetadataMaps);

    if (isDefined(collidingCustomObject)) {
      const { nameSingular, namePlural, labelSingular, labelPlural } =
        this.resolveAvailableOldNames(flatObjectMetadataMaps);

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
      }
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create CallRecording standard objects for workspace ${workspaceId}`,
      );

      return;
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

    const {
      allFlatEntityMaps: standardAllFlatEntityMaps,
      idByUniversalIdentifierByMetadataName,
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });

    const toFlatObjectMetadataMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatObjectMetadata>({
        fromMaps: fromFlatObjectMetadataMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatObjectMetadataMaps,
      });

    const toFlatFieldMetadataMaps =
      this.addNewEntitiesToFlatEntityMaps<FlatFieldMetadata>({
        fromMaps: fromFlatFieldMetadataMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
      });

    const toFlatIndexMaps = this.addNewEntitiesToFlatEntityMaps<FlatIndexMetadata>(
      {
        fromMaps: fromFlatIndexMaps,
        standardBuilderMaps: standardAllFlatEntityMaps.flatIndexMaps,
      },
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
        {
          // `to` is built as a superset of `from` (we only add), so deletion-inference finds nothing to delete.
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
      `Created CallRecording standard objects for workspace ${workspaceId}`,
    );
  }
}
