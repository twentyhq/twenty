import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type ResolvedOrderByField = {
  fieldName: string;
  orderByValue: unknown;
  fieldMetadata: FlatFieldMetadata;
  // false when the field is addressed through its join column (e.g. companyId)
  isAccessedByFieldName: boolean;
};

// Single source of truth for walking an orderBy and resolving each entry to its
// field metadata, shared by column selection, cursor encoding and cursor
// validation so they cannot drift apart. Unknown fields are skipped here: the
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
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  const resolvedOrderByFields: ResolvedOrderByField[] = [];

  for (const orderByEntry of orderBy ?? []) {
    for (const [fieldName, orderByValue] of Object.entries(orderByEntry)) {
      const isAccessedByFieldName = isDefined(fieldIdByName[fieldName]);
      const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId:
          fieldIdByName[fieldName] ?? fieldIdByJoinColumnName[fieldName],
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (!isDefined(fieldMetadata)) {
        continue;
      }

      resolvedOrderByFields.push({
        fieldName,
        orderByValue,
        fieldMetadata,
        isAccessedByFieldName,
      });
    }
  }

  return resolvedOrderByFields;
};
