import {
  FieldMetadataType,
  RelationType,
  type ObjectRecord,
} from 'twenty-shared/types';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type RelationFieldChangeValue = {
  id: string | null;
};

const buildRelationFieldChangeValue = (
  relationId: string | null | undefined,
): RelationFieldChangeValue => ({
  id: isDefined(relationId) ? relationId : null,
});

const isManyToOneRelationField = (
  field: FlatFieldMetadata,
): field is FlatFieldMetadata<FieldMetadataType.RELATION> => {
  return (
    isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) &&
    field.settings?.relationType === RelationType.MANY_TO_ONE
  );
};

const getJoinColumnNameForRelationField = (
  field: FlatFieldMetadata<FieldMetadataType.RELATION>,
) => {
  return (
    field.settings?.joinColumnName ??
    computeMorphOrRelationFieldJoinColumnName({
      name: field.name,
    })
  );
};

export const computeUpdatedFieldsFromDiff = (
  diff: Record<string, unknown>,
  objectMetadataItem: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): string[] => {
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    objectMetadataItem,
  );

  return Object.keys(diff).flatMap((diffKey) => {
    const fieldId = fieldIdByName[diffKey];

    if (!isDefined(fieldId)) {
      return [diffKey];
    }

    const field = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (isDefined(field) && isManyToOneRelationField(field)) {
      return [diffKey, getJoinColumnNameForRelationField(field)];
    }

    return [diffKey];
  });
};

export const objectRecordChangedValues = (
  oldRecord: Partial<ObjectRecord>,
  newRecord: Partial<ObjectRecord>,
  objectMetadataItem: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
) => {
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      objectMetadataItem,
    );

  const findFieldForKey = (key: string) => {
    const fieldId = fieldIdByName[key] ?? fieldIdByJoinColumnName[key];

    if (!isDefined(fieldId)) {
      return undefined;
    }

    return findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });
  };

  const accumulator = Object.keys(newRecord).reduce(
    (diffAccumulator, key) => {
      const field = findFieldForKey(key);

      const oldRecordValue = oldRecord[key];
      const newRecordValue = newRecord[key];

      if (
        key === 'updatedAt' ||
        key === 'searchVector' ||
        field?.type === FieldMetadataType.POSITION ||
        (isDefined(field) && isManyToOneRelationField(field)) ||
        field?.type === FieldMetadataType.RELATION ||
        field?.type === FieldMetadataType.MORPH_RELATION
      ) {
        return diffAccumulator;
      }

      if (fastDeepEqual(oldRecordValue, newRecordValue)) {
        return diffAccumulator;
      }

      diffAccumulator[key] = { before: oldRecordValue, after: newRecordValue };

      return diffAccumulator;
    },

    // oxlint-disable-next-line typescript/no-explicit-any
    {} as Record<string, { before: any; after: any }>,
  );

  const objectFields = getFlatFieldsFromFlatObjectMetadata(
    objectMetadataItem,
    flatFieldMetadataMaps,
  );

  for (const field of objectFields) {
    if (
      !isManyToOneRelationField(field) ||
      isDefined(accumulator[field.name])
    ) {
      continue;
    }

    const joinColumnName = getJoinColumnNameForRelationField(field);
    const oldJoinColumnValue = oldRecord[joinColumnName];
    const newJoinColumnValue = newRecord[joinColumnName];

    if (fastDeepEqual(oldJoinColumnValue, newJoinColumnValue)) {
      continue;
    }

    accumulator[field.name] = {
      before: buildRelationFieldChangeValue(
        oldJoinColumnValue as string | null | undefined,
      ),
      after: buildRelationFieldChangeValue(
        newJoinColumnValue as string | null | undefined,
      ),
    };
  }

  return accumulator;
};
