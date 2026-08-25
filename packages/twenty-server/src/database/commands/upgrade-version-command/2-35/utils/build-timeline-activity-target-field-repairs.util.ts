import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { findFieldRelatedIndexes } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-field-related-index.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type TimelineActivityTargetFieldRepair = {
  flatFieldMetadataToUpdate: UniversalFlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  flatIndexMetadatasToUpdate: UniversalFlatIndexMetadata[];
};

export type TimelineActivityTargetFieldRepairs = {
  repairs: TimelineActivityTargetFieldRepair[];
  skippedRepairs: string[];
};

type BuildTimelineActivityTargetFieldRepairsArgs = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
>;

const EMPTY_REPAIRS: TimelineActivityTargetFieldRepairs = {
  repairs: [],
  skippedRepairs: [],
};

export const buildTimelineActivityTargetFieldRepairs = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
}: BuildTimelineActivityTargetFieldRepairsArgs): TimelineActivityTargetFieldRepairs => {
  const timelineActivityFlatObjectMetadata =
    findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    });

  if (!isDefined(timelineActivityFlatObjectMetadata)) {
    return EMPTY_REPAIRS;
  }

  const timelineActivityFlatFieldMetadatas =
    getFlatFieldsFromFlatObjectMetadata(
      timelineActivityFlatObjectMetadata,
      flatFieldMetadataMaps,
    );

  // Renaming into a name another field already holds would fail validation for
  // the whole workspace, so track occupancy and let accepted renames free their
  // former name for a later candidate.
  const takenFieldNames = new Set(
    timelineActivityFlatFieldMetadatas.map(({ name }) => name),
  );

  return timelineActivityFlatFieldMetadatas.reduce<TimelineActivityTargetFieldRepairs>(
    (accumulator, flatFieldMetadata) => {
      if (
        !isFlatFieldMetadataOfType(
          flatFieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        ) ||
        flatFieldMetadata.morphId !==
          STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId ||
        flatFieldMetadata.universalSettings.relationType !==
          RelationType.MANY_TO_ONE ||
        !isDefined(flatFieldMetadata.relationTargetObjectMetadataId)
      ) {
        return accumulator;
      }

      const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
      });

      if (!isDefined(targetFlatObjectMetadata)) {
        return accumulator;
      }

      const expectedName = `target${capitalize(
        targetFlatObjectMetadata.nameSingular,
      )}`;
      const expectedJoinColumnName = computeMorphOrRelationFieldJoinColumnName({
        name: expectedName,
      });

      if (flatFieldMetadata.name === expectedName) {
        // The runner derives the column rename from the field name alone, so a
        // join column that drifted on its own cannot be repaired here without
        // pointing the metadata at a column that was never renamed.
        if (
          flatFieldMetadata.universalSettings.joinColumnName !==
          expectedJoinColumnName
        ) {
          return {
            ...accumulator,
            skippedRepairs: [
              ...accumulator.skippedRepairs,
              `${flatFieldMetadata.name} (join column is ${flatFieldMetadata.universalSettings.joinColumnName}, expected ${expectedJoinColumnName}, needs manual repair)`,
            ],
          };
        }

        return accumulator;
      }

      if (takenFieldNames.has(expectedName)) {
        return {
          ...accumulator,
          skippedRepairs: [
            ...accumulator.skippedRepairs,
            `${flatFieldMetadata.name} -> ${expectedName} (name already taken on timelineActivity)`,
          ],
        };
      }

      takenFieldNames.delete(flatFieldMetadata.name);
      takenFieldNames.add(expectedName);

      const flatIndexMetadatasToUpdate =
        recomputeIndexOnFlatFieldMetadataNameUpdate({
          flatFieldMetadataMaps,
          flatObjectMetadata: timelineActivityFlatObjectMetadata,
          fromFlatFieldMetadata: flatFieldMetadata,
          toFlatFieldMetadata: {
            name: expectedName,
            isUnique: flatFieldMetadata.isUnique,
          },
          relatedFlatIndexMetadata: findFieldRelatedIndexes({
            flatFieldMetadata,
            flatObjectMetadata: timelineActivityFlatObjectMetadata,
            flatIndexMaps,
          }),
        });

      return {
        skippedRepairs: accumulator.skippedRepairs,
        repairs: [
          ...accumulator.repairs,
          {
            flatFieldMetadataToUpdate: {
              ...flatFieldMetadata,
              name: expectedName,
              label:
                flatFieldMetadata.isSystemSideEffect === true
                  ? capitalize(targetFlatObjectMetadata.nameSingular)
                  : flatFieldMetadata.label,
              universalSettings: {
                ...flatFieldMetadata.universalSettings,
                joinColumnName: expectedJoinColumnName,
              },
            },
            flatIndexMetadatasToUpdate,
          },
        ],
      };
    },
    EMPTY_REPAIRS,
  );
};
