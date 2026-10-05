import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { type EstimatedRowsUsage } from 'src/engine/api/common/common-query-runners/types/estimated-rows-usage.type';
import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { estimateRelationRowsRead } from 'src/engine/api/common/common-query-runners/utils/estimate-relation-rows-read.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';

const estimatePositionBoundaryRowsRead = (
  context: RowsEstimationContext,
): number => {
  if (!isDefined(context.fieldIdByName.position)) {
    return 0;
  }

  return context.indexedColumnByName.has('position') ? 1 : context.recordCount;
};

export const estimateCreatedRecordsRowsUsage = ({
  createdRecordCount,
  isUpsert,
  select,
  context,
}: {
  createdRecordCount: number;
  isUpsert: boolean;
  select: CommonSelectedFields;
  context: RowsEstimationContext;
}): EstimatedRowsUsage => {
  const uniqueColumnCount = [...context.indexedColumnByName.values()].filter(
    (indexedColumn) => indexedColumn.isUnique,
  ).length;

  const lookupRowsRead = isUpsert
    ? createdRecordCount * uniqueColumnCount
    : estimatePositionBoundaryRowsRead(context);

  return {
    rowsRead:
      lookupRowsRead +
      estimateRelationRowsRead({
        select,
        parentRowCount: createdRecordCount,
        context,
        recordLimitPerParent: QUERY_MAX_RECORDS,
      }),
    rowsWritten: createdRecordCount,
  };
};
