import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { computeOrderByLeafColumn } from 'src/engine/api/utils/compute-order-by-leaf-column.util';
import {
  checkIfLeafCanCarryCursorValue,
  resolveOrderByLeaves,
} from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Cursors read orderBy values from the record: an unselected one degrades to an id-only cursor that skips records (#24333)
export const buildOrderByColumnsToSelect = ({
  orderBy,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  orderBy: ObjectRecordOrderBy | undefined;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Record<string, boolean> => {
  const columnsToSelect: Record<string, boolean> = {};

  for (const leaf of resolveOrderByLeaves({
    orderBy,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  }).filter(checkIfLeafCanCarryCursorValue)) {
    // Cursors read relation values from the ordering join's raw rows, not a root column
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
