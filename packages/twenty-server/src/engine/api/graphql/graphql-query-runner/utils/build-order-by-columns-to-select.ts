import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { resolveOrderByFields } from 'src/engine/api/utils/resolve-order-by-fields.utils';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
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

  for (const resolvedOrderByField of resolveOrderByFields({
    orderBy,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  })) {
    switch (resolvedOrderByField.kind) {
      // Relation orderBy values live on a joined alias, they cannot hydrate
      // onto the root entity through a column selection
      case 'relation':
        break;
      case 'composite':
        for (const property of resolvedOrderByField.orderedCompositeProperties) {
          columnsToSelect[
            computeCompositeColumnName(resolvedOrderByField.fieldName, property)
          ] = true;
        }
        break;
      case 'scalar':
        columnsToSelect[resolvedOrderByField.fieldName] = true;
        break;
    }
  }

  return columnsToSelect;
};
