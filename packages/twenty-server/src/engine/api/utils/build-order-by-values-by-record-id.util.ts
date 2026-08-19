import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  checkIfLeafCanCarryCursorValue,
  type OrderByLeaf,
} from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

export type OrderByValuesByRecordId = Record<string, Record<string, unknown>>;

const computeRawColumnAlias = (
  leaf: OrderByLeaf,
  objectNameSingular: string,
): string => {
  switch (leaf.kind) {
    // The relation ordering always selects its joined columns under the
    // deterministic "<joinAlias>_<column>" raw alias, whatever the client
    // selected (see addRelationOrderColumnsToBuilder)
    case 'relation':
      return `${leaf.path[0]}_${
        isDefined(leaf.targetCompositeProperty)
          ? computeCompositeColumnName(
              leaf.path[1],
              leaf.targetCompositeProperty,
            )
          : leaf.path[1]
      }`;
    case 'composite':
      return `${objectNameSingular}_${computeCompositeColumnName(leaf.path[0], leaf.compositeProperty)}`;
    case 'scalar':
      return `${objectNameSingular}_${leaf.path[0]}`;
  }
};

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
      const rawValue = rawRow[computeRawColumnAlias(leaf, objectNameSingular)];

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
