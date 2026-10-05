import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { estimateRowsReadForColumnCondition } from 'src/engine/api/common/common-query-runners/utils/estimate-rows-read-for-column-condition.util';

export const estimateDuplicateCriteriaRowsRead = (
  context: RowsEstimationContext,
): number =>
  Math.min(
    context.recordCount,
    (context.flatObjectMetadata.duplicateCriteria ?? []).reduce(
      (rowsRead, criteria) =>
        rowsRead +
        Math.min(
          ...criteria.map((columnName) =>
            estimateRowsReadForColumnCondition(
              columnName,
              { eq: null },
              context,
            ),
          ),
        ),
      0,
    ),
  );
