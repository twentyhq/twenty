import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeOrderByLeafColumn } from 'src/engine/api/utils/compute-order-by-leaf-column.util';
import {
  checkIfLeafCanCarryCursorValue,
  type OrderByLeaf,
} from 'src/engine/api/utils/resolve-order-by-leaves.utils';

export type OrderByValuesByRecordId = Record<string, Record<string, unknown>>;

// Cursors are encoded from the raw rows of the scan rather than from the
// formatted records: result formatting presents SQL NULLs of TEXT-like columns
// as empty values, but only actual SQL NULLs sort into the NULL block the
// cursor must continue from. This also carries relation orderBy values without
// requiring the ordered relation in the selection (or any REST depth).
export const buildOrderByValuesByRecordId = ({
  orderByLeaves,
  records,
  rawRows,
  objectNameSingular,
}: {
  orderByLeaves: OrderByLeaf[];
  records: ObjectRecord[];
  rawRows: Record<string, unknown>[];
  objectNameSingular: string;
}): OrderByValuesByRecordId => {
  const cursorLeaves = orderByLeaves.filter(checkIfLeafCanCarryCursorValue);

  if (cursorLeaves.length === 0 || records.length === 0) {
    return {};
  }

  // The runner rejects row-multiplying joins, so raw rows and entities match
  // one to one; the root id raw alias keys the pairing when available
  const rootIdRawAlias = `${objectNameSingular}_id`;
  const rawRowsByRecordId = new Map<string, Record<string, unknown>>();

  rawRows.forEach((rawRow, index) => {
    const recordId = (rawRow[rootIdRawAlias] ?? records[index]?.id) as
      | string
      | undefined;

    if (isDefined(recordId)) {
      rawRowsByRecordId.set(recordId, rawRow);
    }
  });

  const orderByValuesByRecordId: OrderByValuesByRecordId = {};

  for (const record of records) {
    const rawRow = rawRowsByRecordId.get(record.id);

    if (!isDefined(rawRow)) {
      continue;
    }

    const orderByValues: Record<string, unknown> = {};

    for (const leaf of cursorLeaves) {
      const leafColumn = computeOrderByLeafColumn(leaf, objectNameSingular);

      if (!isDefined(leafColumn)) {
        continue;
      }

      // Every ordered column is selected under this raw alias, by the find
      // options for root columns and by addRelationOrderColumnsToBuilder for
      // joined ones
      const rawValue =
        rawRow[`${leafColumn.tableAlias}_${leafColumn.columnName}`];

      let container = orderByValues;

      for (const key of leaf.path.slice(0, -1)) {
        container[key] = isDefined(container[key]) ? container[key] : {};
        container = container[key] as Record<string, unknown>;
      }
      container[leaf.path[leaf.path.length - 1]] = rawValue;
    }

    orderByValuesByRecordId[record.id] = orderByValues;
  }

  return orderByValuesByRecordId;
};
