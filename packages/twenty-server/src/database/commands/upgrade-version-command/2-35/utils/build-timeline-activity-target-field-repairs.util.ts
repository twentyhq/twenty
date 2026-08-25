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
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type UnrepairableTargetField = {
  fieldName: string;
  expectedName: string;
  reason: string;
};

export type TimelineActivityTargetFieldRepairs = {
  flatFieldMetadatasToUpdate: UniversalFlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[];
  flatIndexMetadatasToUpdate: UniversalFlatIndexMetadata[];
  unrepairableTargetFields: UnrepairableTargetField[];
};

type BuildTimelineActivityTargetFieldRepairsArgs = Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps' | 'flatIndexMaps'
> & {
  existingColumnNames: Set<string>;
};

type RepairCandidate = {
  flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  targetObjectNameSingular: string;
  expectedName: string;
  expectedJoinColumnName: string;
};

const EMPTY_REPAIRS: TimelineActivityTargetFieldRepairs = {
  flatFieldMetadatasToUpdate: [],
  flatIndexMetadatasToUpdate: [],
  unrepairableTargetFields: [],
};

const collectRepairCandidates = ({
  timelineActivityFlatFieldMetadatas,
  flatObjectMetadataMaps,
}: {
  timelineActivityFlatFieldMetadatas: FlatFieldMetadata[];
} & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'>): RepairCandidate[] =>
  timelineActivityFlatFieldMetadatas.flatMap((flatFieldMetadata) => {
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
      return [];
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
    });

    if (!isDefined(targetFlatObjectMetadata)) {
      return [];
    }

    const expectedName = `target${capitalize(
      targetFlatObjectMetadata.nameSingular,
    )}`;

    if (flatFieldMetadata.name === expectedName) {
      return [];
    }

    return [
      {
        flatFieldMetadata,
        targetObjectNameSingular: targetFlatObjectMetadata.nameSingular,
        expectedName,
        expectedJoinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: expectedName,
        }),
      },
    ];
  });

const classifyPhysicalColumn = ({
  repairCandidate,
  existingColumnNames,
}: {
  repairCandidate: RepairCandidate;
  existingColumnNames: Set<string>;
}): string | undefined => {
  const currentColumnName = computeMorphOrRelationFieldJoinColumnName({
    name: repairCandidate.flatFieldMetadata.name,
  });
  const hasCurrentColumn = existingColumnNames.has(currentColumnName);
  const hasExpectedColumn = existingColumnNames.has(
    repairCandidate.expectedJoinColumnName,
  );

  if (hasCurrentColumn && !hasExpectedColumn) {
    return undefined;
  }

  if (!hasCurrentColumn && hasExpectedColumn) {
    return `column ${repairCandidate.expectedJoinColumnName} already exists while metadata still names it ${currentColumnName}; the rename path cannot apply a metadata-only fix`;
  }

  if (hasCurrentColumn && hasExpectedColumn) {
    return `columns ${currentColumnName} and ${repairCandidate.expectedJoinColumnName} both exist; renaming would collide`;
  }

  return `neither column ${currentColumnName} nor ${repairCandidate.expectedJoinColumnName} exists on the table`;
};

// One index can cover several repaired fields, so it is recomputed once against
// every accepted rename rather than once per field, which would emit the same
// index twice under two partially-renamed names.
const recomputeAffectedIndexes = ({
  acceptedRepairCandidates,
  timelineActivityFlatObjectMetadata,
  timelineActivityFlatFieldMetadatas,
  flatIndexMaps,
}: {
  acceptedRepairCandidates: RepairCandidate[];
  timelineActivityFlatObjectMetadata: FlatObjectMetadata;
  timelineActivityFlatFieldMetadatas: FlatFieldMetadata[];
} & Pick<AllFlatEntityMaps, 'flatIndexMaps'>): UniversalFlatIndexMetadata[] => {
  const expectedNameByFieldId = new Map(
    acceptedRepairCandidates.map((repairCandidate) => [
      repairCandidate.flatFieldMetadata.id,
      repairCandidate.expectedName,
    ]),
  );

  const optimisticFlatFieldMetadatas = timelineActivityFlatFieldMetadatas.map(
    (flatFieldMetadata) => {
      const expectedName = expectedNameByFieldId.get(flatFieldMetadata.id);

      return isDefined(expectedName)
        ? { ...flatFieldMetadata, name: expectedName }
        : flatFieldMetadata;
    },
  );

  const affectedFlatIndexById = new Map<string, FlatIndexMetadata>();

  for (const repairCandidate of acceptedRepairCandidates) {
    for (const flatIndexMetadata of findFieldRelatedIndexes({
      flatFieldMetadata: repairCandidate.flatFieldMetadata,
      flatObjectMetadata: timelineActivityFlatObjectMetadata,
      flatIndexMaps,
    })) {
      affectedFlatIndexById.set(flatIndexMetadata.id, flatIndexMetadata);
    }
  }

  return [...affectedFlatIndexById.values()].map((flatIndex) =>
    generateFlatIndexMetadataWithNameOrThrow({
      flatIndex,
      flatObjectMetadata: timelineActivityFlatObjectMetadata,
      objectFlatFieldMetadatas: optimisticFlatFieldMetadatas,
    }),
  );
};

const findMissingIndexMetadataIds = ({
  timelineActivityFlatObjectMetadata,
  flatIndexMaps,
}: {
  timelineActivityFlatObjectMetadata: FlatObjectMetadata;
} & Pick<AllFlatEntityMaps, 'flatIndexMaps'>): string[] =>
  timelineActivityFlatObjectMetadata.indexMetadataIds.filter(
    (indexMetadataId) =>
      !isDefined(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatIndexMaps,
          flatEntityId: indexMetadataId,
        }),
      ),
  );

export const buildTimelineActivityTargetFieldRepairs = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  existingColumnNames,
}: BuildTimelineActivityTargetFieldRepairsArgs): TimelineActivityTargetFieldRepairs => {
  const timelineActivityFlatObjectMetadata =
    findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
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

  // A rename is judged only against the workspace as it stands, never against
  // the outcome of another rename in the same batch. Chains therefore stay
  // blocked rather than resolving differently depending on field order, which
  // is what the physical columns force anyway: the name a chain wants to move
  // into is still occupied by a column at the moment the batch is planned.
  const heldFieldNames = new Set(
    timelineActivityFlatFieldMetadatas.map(({ name }) => name),
  );

  const { accepted, unrepairableTargetFields } = collectRepairCandidates({
    timelineActivityFlatFieldMetadatas,
    flatObjectMetadataMaps,
  }).reduce<{
    accepted: RepairCandidate[];
    unrepairableTargetFields: UnrepairableTargetField[];
  }>(
    (accumulator, repairCandidate) => {
      const reason = heldFieldNames.has(repairCandidate.expectedName)
        ? `${repairCandidate.expectedName} is held by another field on timelineActivity that this command does not rename`
        : classifyPhysicalColumn({ repairCandidate, existingColumnNames });

      if (isDefined(reason)) {
        accumulator.unrepairableTargetFields.push({
          fieldName: repairCandidate.flatFieldMetadata.name,
          expectedName: repairCandidate.expectedName,
          reason,
        });

        return accumulator;
      }

      accumulator.accepted.push(repairCandidate);

      return accumulator;
    },
    { accepted: [], unrepairableTargetFields: [] },
  );

  const missingIndexMetadataIds = findMissingIndexMetadataIds({
    timelineActivityFlatObjectMetadata,
    flatIndexMaps,
  });

  if (accepted.length > 0 && missingIndexMetadataIds.length > 0) {
    return {
      flatFieldMetadatasToUpdate: [],
      flatIndexMetadatasToUpdate: [],
      unrepairableTargetFields: [
        ...unrepairableTargetFields,
        ...accepted.map(({ flatFieldMetadata, expectedName }) => ({
          fieldName: flatFieldMetadata.name,
          expectedName,
          reason: `timelineActivity references missing index metadata ${missingIndexMetadataIds.join(', ')}; index dependencies cannot be recomputed safely`,
        })),
      ],
    };
  }

  return {
    flatFieldMetadatasToUpdate: accepted.map(
      ({
        flatFieldMetadata,
        expectedName,
        expectedJoinColumnName,
        targetObjectNameSingular,
      }) => ({
        ...flatFieldMetadata,
        name: expectedName,
        label: flatFieldMetadata.isSystemSideEffect
          ? capitalize(targetObjectNameSingular)
          : flatFieldMetadata.label,
        universalSettings: {
          ...flatFieldMetadata.universalSettings,
          joinColumnName: expectedJoinColumnName,
        },
      }),
    ),
    flatIndexMetadatasToUpdate: recomputeAffectedIndexes({
      acceptedRepairCandidates: accepted,
      timelineActivityFlatObjectMetadata,
      timelineActivityFlatFieldMetadatas,
      flatIndexMaps,
    }),
    unrepairableTargetFields,
  };
};
