import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { computeOrderByLeafColumn } from 'src/engine/api/utils/compute-order-by-leaf-column.util';
import {
  checkIfLeafCanCarryCursorValue,
  resolveOrderByLeaves,
} from 'src/engine/api/utils/resolve-order-by-leaves.utils';
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

  for (const leaf of resolveOrderByLeaves({
    orderBy,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }).filter(checkIfLeafCanCarryCursorValue)) {
    // Relation orderBy values live on a joined alias, not on a root column:
    // cursors read them from the ordering join's raw rows instead
    if (leaf.kind === 'relation') {
      continue;
    }

    const leafColumn = computeOrderByLeafColumn(
      leaf,
      flatObjectMetadata.nameSingular,
    );

    if (isDefined(leafColumn)) {
      columnsToSelect[leafColumn.columnName] = true;
    }
  }

  return columnsToSelect;
};
