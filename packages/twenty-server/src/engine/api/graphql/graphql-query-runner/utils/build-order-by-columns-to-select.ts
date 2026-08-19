import { capitalize, isPlainObject } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { resolveOrderByFields } from 'src/engine/api/utils/resolve-order-by-fields.utils';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Cursor encoding reads orderBy values from the hydrated record, so every column the
// query is ordered by must be selected even when the client did not request it.
// Otherwise the cursor silently degrades to an id-only cursor and pagination skips
// records (see issue #24333).
export const buildOrderByColumnsToSelect = ({
  orderBy,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  orderBy: ObjectRecordOrderBy | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Record<string, boolean> => {
  const columnsToSelect: Record<string, boolean> = {};

  for (const {
    fieldName,
    orderByValue,
    fieldMetadata,
    isAccessedByFieldName,
  } of resolveOrderByFields({
    orderBy,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  })) {
    if (
      isAccessedByFieldName &&
      isMorphOrRelationFlatFieldMetadata(fieldMetadata)
    ) {
      // Relation orderBy values live on a joined alias, they cannot hydrate
      // onto the root entity through a column selection
      continue;
    }

    if (
      isCompositeFieldMetadataType(fieldMetadata.type) &&
      isPlainObject(orderByValue)
    ) {
      for (const subFieldKey of Object.keys(
        orderByValue as Record<string, unknown>,
      )) {
        columnsToSelect[`${fieldMetadata.name}${capitalize(subFieldKey)}`] =
          true;
      }
      continue;
    }

    // Join column access (e.g. companyId) selects the column under its own name
    columnsToSelect[isAccessedByFieldName ? fieldMetadata.name : fieldName] =
      true;
  }

  return columnsToSelect;
};
