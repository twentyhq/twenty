import {
  type CompositeProperty,
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { resolveFilterKeyFieldMetadata } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/resolve-filter-key-field-metadata.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type ResolvedOrderByField = {
  fieldName: string;
  orderByValue: unknown;
  fieldMetadata: FlatFieldMetadata;
} & (
  | // Scalar columns, including join columns addressed directly (e.g. companyId)
    { kind: 'scalar' } // RAW_JSON sub-fields are pruned: they take no part in ordering or cursors
  | { kind: 'composite'; orderedCompositeProperties: CompositeProperty[] }
  | { kind: 'relation'; orderedSubFieldNames: string[] }
);

// Single source of truth for walking an orderBy: each entry is resolved to its
// field metadata and classified, so column selection, cursor encoding and
// cursor validation cannot drift apart. Unknown fields are skipped here: the
// orderBy parser rejects them with a dedicated error.
export const resolveOrderByFields = ({
  orderBy,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  orderBy: ObjectRecordOrderBy | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ResolvedOrderByField[] => {
  if (!isDefined(orderBy) || !isNonEmptyArray(orderBy)) {
    return [];
  }

  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  const resolvedOrderByFields: ResolvedOrderByField[] = [];

  for (const orderByEntry of orderBy) {
    for (const [fieldName, orderByValue] of Object.entries(orderByEntry)) {
      const { fieldMetadata, isReferencedByFieldName } =
        resolveFilterKeyFieldMetadata({
          filterKey: fieldName,
          fieldIdByName,
          fieldIdByJoinColumnName,
          flatFieldMetadataMaps,
        });

      if (!isDefined(fieldMetadata)) {
        continue;
      }

      const orderedSubFieldNames = isPlainObject(orderByValue)
        ? Object.keys(orderByValue)
        : [];

      if (
        isReferencedByFieldName &&
        isMorphOrRelationFlatFieldMetadata(fieldMetadata)
      ) {
        resolvedOrderByFields.push({
          kind: 'relation',
          fieldName,
          orderByValue,
          fieldMetadata,
          orderedSubFieldNames,
        });
        continue;
      }

      if (
        isReferencedByFieldName &&
        isCompositeFieldMetadataType(fieldMetadata.type)
      ) {
        const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

        resolvedOrderByFields.push({
          kind: 'composite',
          fieldName,
          orderByValue,
          fieldMetadata,
          orderedCompositeProperties: orderedSubFieldNames
            .map((subFieldName) =>
              compositeType?.properties.find(
                (property) =>
                  property.name === subFieldName &&
                  property.type !== FieldMetadataType.RAW_JSON,
              ),
            )
            .filter(isDefined),
        });
        continue;
      }

      resolvedOrderByFields.push({
        kind: 'scalar',
        fieldName,
        orderByValue,
        fieldMetadata,
      });
    }
  }

  return resolvedOrderByFields;
};
