import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type OrderByLeaf } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

export type RelationOrderValuesByRecordId = Record<
  string,
  Record<string, unknown>
>;

// The relation ordering always selects its joined columns under the
// deterministic "<joinAlias>_<column>" raw alias (see
// addRelationOrderColumnsToBuilder), whatever the client selected. Reading the
// ordered values back from the raw rows is what makes relation cursors
// independent of the selection set and of the REST depth.
export const buildRelationOrderValuesByRecordId = ({
  relationOrderByLeaves,
  records,
  rawRows,
  objectNameSingular,
}: {
  relationOrderByLeaves: OrderByLeaf[];
  records: ObjectRecord[];
  rawRows: Record<string, unknown>[];
  objectNameSingular: string;
}): RelationOrderValuesByRecordId => {
  if (relationOrderByLeaves.length === 0 || records.length === 0) {
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

  const relationOrderValuesByRecordId: RelationOrderValuesByRecordId = {};

  for (const record of records) {
    const rawRow = rawRowsByRecordId.get(record.id);

    if (!isDefined(rawRow)) {
      continue;
    }

    const relationOrderValues: Record<string, unknown> = {};

    for (const leaf of relationOrderByLeaves) {
      if (leaf.kind !== 'relation') {
        continue;
      }

      const joinedColumnName = isDefined(leaf.targetCompositeProperty)
        ? computeCompositeColumnName(
            leaf.path[1],
            leaf.targetCompositeProperty,
          )
        : leaf.path[1];
      const rawValue = rawRow[`${leaf.path[0]}_${joinedColumnName}`] ?? null;

      let container = relationOrderValues;

      for (const key of leaf.path.slice(0, -1)) {
        container[key] = isDefined(container[key]) ? container[key] : {};
        container = container[key] as Record<string, unknown>;
      }
      container[leaf.path[leaf.path.length - 1]] = rawValue;
    }

    relationOrderValuesByRecordId[record.id] = relationOrderValues;
  }

  return relationOrderValuesByRecordId;
};
