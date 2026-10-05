import { isDefined } from 'twenty-shared/utils';

import { type IndexedColumn } from 'src/engine/api/common/common-query-runners/types/indexed-column.type';
import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { getApproximateRecordCount } from 'src/engine/api/common/common-query-runners/utils/get-approximate-record-count.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';

const POSTGRES_DEFAULT_EQUALITY_SELECTIVITY = 0.005;
const POSTGRES_DEFAULT_RANGE_SELECTIVITY = 1 / 3;

const estimateRowsMatchingOneValue = (
  indexedColumn: IndexedColumn,
  context: RowsEstimationContext,
): number => {
  if (indexedColumn.isUnique) {
    return 1;
  }

  if (isDefined(indexedColumn.relationTargetObjectMetadataId)) {
    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: indexedColumn.relationTargetObjectMetadataId,
      flatEntityMaps: context.flatObjectMetadataMaps,
    });

    return (
      context.recordCount /
      (getApproximateRecordCount(
        targetFlatObjectMetadata,
        context.approximateRecordCountByTableName,
      ) || 1)
    );
  }

  return context.recordCount * POSTGRES_DEFAULT_EQUALITY_SELECTIVITY;
};

export const estimateRowsReadForColumnCondition = (
  columnName: string,
  condition: Record<string, unknown>,
  context: RowsEstimationContext,
): number => {
  const indexedColumn = context.indexedColumnByName.get(columnName);

  if (!isDefined(indexedColumn)) {
    return context.recordCount;
  }

  const [[operator, value]] = Object.entries(condition);

  switch (operator) {
    case 'eq':
    case 'eqStrict':
      return estimateRowsMatchingOneValue(indexedColumn, context);
    case 'in':
      return (
        (value as unknown[]).length *
        estimateRowsMatchingOneValue(indexedColumn, context)
      );
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
      return context.recordCount * POSTGRES_DEFAULT_RANGE_SELECTIVITY;
    default:
      return context.recordCount;
  }
};
