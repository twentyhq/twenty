import { Command } from 'nest-commander';

import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const DEFAULT_RELATION_TARGET_MORPH_IDS = new Set<string>(
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map(
    (standardObjectNameSingular) =>
      STANDARD_OBJECTS[standardObjectNameSingular].morphIds.targetMorphId
        .morphId,
  ),
);

const computeQualifiedFieldName = ({
  flatFieldMetadata,
  standardFlatObjectMetadataMaps,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  standardFlatObjectMetadataMaps: TwentyStandardAllFlatEntityMaps['flatObjectMetadataMaps'];
}) => {
  const hostObjectNameSingular =
    standardFlatObjectMetadataMaps.byUniversalIdentifier[
      flatFieldMetadata.objectMetadataUniversalIdentifier
    ]?.nameSingular ?? flatFieldMetadata.objectMetadataUniversalIdentifier;

  return `${hostObjectNameSingular}.${flatFieldMetadata.name}`;
};

@RegisteredWorkspaceCommand('2.35.0', 1787582101000)
@Command({
  name: 'upgrade:2-35:restore-standard-default-relation-fields',
  description:
    'Recreate the standard default-relation pairs (target* morph legs on attachment/noteTarget/taskTarget/timelineActivity and their forward relation fields) that were deleted from some workspaces by pre-2.20 application syncs, along with their join-column indexes. No-op on healthy workspaces.',
})
export class RestoreStandardDefaultRelationFieldsCommand extends ProvisionedWorkspaceCommandRunner {
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
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
      flatIndexMaps: existingFlatIndexMaps,
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatFieldMetadataMaps',
      'flatIndexMaps',
      'flatObjectMetadataMaps',
    ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const takenFieldNamesByObject = new Map<string, Set<string>>();

    for (const existingFlatFieldMetadata of Object.values(
      existingFlatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      const takenFieldNames =
        takenFieldNamesByObject.get(
          existingFlatFieldMetadata.objectMetadataUniversalIdentifier,
        ) ?? new Set<string>();

      takenFieldNames.add(existingFlatFieldMetadata.name);
      takenFieldNamesByObject.set(
        existingFlatFieldMetadata.objectMetadataUniversalIdentifier,
        takenFieldNames,
      );
    }

    const standardDefaultRelationLegs = Object.values(
      standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (standardFlatFieldMetadata) =>
          standardFlatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
          isDefined(standardFlatFieldMetadata.morphId) &&
          DEFAULT_RELATION_TARGET_MORPH_IDS.has(
            standardFlatFieldMetadata.morphId,
          ),
      );

    const fieldsToCreate: FlatFieldMetadata[] = [];
    const skippedPairLabels: string[] = [];

    for (const standardDefaultRelationLeg of standardDefaultRelationLegs) {
      const standardForwardFlatFieldMetadata = isDefined(
        standardDefaultRelationLeg.relationTargetFieldMetadataUniversalIdentifier,
      )
        ? standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
            standardDefaultRelationLeg
              .relationTargetFieldMetadataUniversalIdentifier
          ]
        : undefined;

      if (!isDefined(standardForwardFlatFieldMetadata)) {
        continue;
      }

      const standardPairMembers = [
        standardDefaultRelationLeg,
        standardForwardFlatFieldMetadata,
      ];

      const missingPairMembers = standardPairMembers.filter(
        (standardFlatFieldMetadata) =>
          !isDefined(
            existingFlatFieldMetadataMaps.byUniversalIdentifier[
              standardFlatFieldMetadata.universalIdentifier
            ],
          ),
      );

      if (missingPairMembers.length === 0) {
        continue;
      }

      const pairHasSurvivingMember =
        missingPairMembers.length < standardPairMembers.length;

      const pairIsBlocked = missingPairMembers.some(
        (standardFlatFieldMetadata) => {
          const hostObjectExists = isDefined(
            findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
              flatEntityMaps: existingFlatObjectMetadataMaps,
              universalIdentifier:
                standardFlatFieldMetadata.objectMetadataUniversalIdentifier,
            }),
          );

          const fieldNameIsTaken =
            takenFieldNamesByObject
              .get(standardFlatFieldMetadata.objectMetadataUniversalIdentifier)
              ?.has(standardFlatFieldMetadata.name) === true;

          return !hostObjectExists || fieldNameIsTaken;
        },
      );

      if (pairHasSurvivingMember || pairIsBlocked) {
        skippedPairLabels.push(
          standardPairMembers
            .map((standardFlatFieldMetadata) =>
              computeQualifiedFieldName({
                flatFieldMetadata: standardFlatFieldMetadata,
                standardFlatObjectMetadataMaps:
                  standardAllFlatEntityMaps.flatObjectMetadataMaps,
              }),
            )
            .join(' / '),
        );
        continue;
      }

      fieldsToCreate.push(...missingPairMembers);
    }

    const availableFieldUniversalIdentifiers = new Set<string>([
      ...Object.keys(existingFlatFieldMetadataMaps.byUniversalIdentifier),
      ...fieldsToCreate.map(({ universalIdentifier }) => universalIdentifier),
    ]);
    const createdFieldUniversalIdentifiers = new Set<string>(
      fieldsToCreate.map(({ universalIdentifier }) => universalIdentifier),
    );

    const indexesToCreate: FlatIndexMetadata[] = Object.values(
      standardAllFlatEntityMaps.flatIndexMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((standardFlatIndexMetadata) => {
        const indexIsMissing = !isDefined(
          existingFlatIndexMaps.byUniversalIdentifier[
            standardFlatIndexMetadata.universalIdentifier
          ],
        );

        const indexReferencesARestoredField =
          standardFlatIndexMetadata.universalFlatIndexFieldMetadatas.some(
            (universalFlatIndexFieldMetadata) =>
              createdFieldUniversalIdentifiers.has(
                universalFlatIndexFieldMetadata.fieldMetadataUniversalIdentifier,
              ),
          );

        const allIndexFieldsExistOrAreRestored =
          standardFlatIndexMetadata.universalFlatIndexFieldMetadatas.every(
            (universalFlatIndexFieldMetadata) =>
              availableFieldUniversalIdentifiers.has(
                universalFlatIndexFieldMetadata.fieldMetadataUniversalIdentifier,
              ),
          );

        return (
          indexIsMissing &&
          indexReferencesARestoredField &&
          allIndexFieldsExistOrAreRestored
        );
      });

    if (skippedPairLabels.length > 0) {
      this.logger.warn(
        `Skipped ${skippedPairLabels.length} unrestorable standard default-relation pair(s) for workspace ${workspaceId}: ${skippedPairLabels.join(', ')}`,
      );
    }

    if (fieldsToCreate.length === 0) {
      if (skippedPairLabels.length === 0) {
        this.logger.log(
          `Standard default-relation fields are complete for workspace ${workspaceId}, skipping`,
        );
      }

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Restoring ${fieldsToCreate.length} standard default-relation field(s) and ${indexesToCreate.length} index(es) for workspace ${workspaceId}`,
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
            fieldMetadata: {
              flatEntityToCreate: fieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            index: {
              flatEntityToCreate: indexesToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to restore standard default-relation fields for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Restored ${fieldsToCreate.length} standard default-relation field(s) for workspace ${workspaceId}`,
    );
  }
}
