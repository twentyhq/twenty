import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { type AggregationField } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/twenty-orm/utils/get-column-name-to-field-metadata-id.util';

export const filterRestrictedFieldsFromSelect = ({
  select,
  restrictedFields,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  select: Record<string, unknown>;
  restrictedFields: RestrictedFieldsPermissions | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Record<string, unknown> => {
  if (!restrictedFields || Object.keys(restrictedFields).length === 0) {
    return select;
  }

  // Use the same column-to-field mapping as the permission validator
  // This covers simple fields, composite sub-columns (e.g. ltvAmountMicros),
  // and FK join columns (e.g. leadSourceId)
  const columnNameToFieldMetadataIdMap = getColumnNameToFieldMetadataIdMap(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(select)) {
    const fieldId = columnNameToFieldMetadataIdMap[key];

    if (!fieldId || restrictedFields[fieldId]?.canRead !== false) {
      filtered[key] = value;
    }
  }

  return filtered;
};

export const filterRestrictedFieldsFromRelations = ({
  relations,
  restrictedFields,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  relations: Record<string, unknown> | undefined;
  restrictedFields: RestrictedFieldsPermissions | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Record<string, unknown> | undefined => {
  if (!relations) {
    return relations;
  }

  if (!restrictedFields || Object.keys(restrictedFields).length === 0) {
    return relations;
  }

  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(relations)) {
    const fieldId = fieldIdByName[key];

    if (!fieldId || restrictedFields[fieldId]?.canRead !== false) {
      filtered[key] = value;
    }
  }

  return filtered;
};

export const filterRestrictedFieldsFromAggregate = ({
  aggregate,
  restrictedFields,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  aggregate: Record<string, AggregationField>;
  restrictedFields: RestrictedFieldsPermissions | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Record<string, AggregationField> => {
  if (!restrictedFields || Object.keys(restrictedFields).length === 0) {
    return aggregate;
  }

  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  const filtered: Record<string, AggregationField> = {};

  for (const [key, value] of Object.entries(aggregate)) {
    const fieldId = fieldIdByName[value.fromField];

    if (!fieldId || restrictedFields[fieldId]?.canRead !== false) {
      filtered[key] = value;
    }
  }

  return filtered;
};
