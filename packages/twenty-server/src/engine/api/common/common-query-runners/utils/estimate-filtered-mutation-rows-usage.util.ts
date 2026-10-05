import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type EstimatedRowsUsage } from 'src/engine/api/common/common-query-runners/types/estimated-rows-usage.type';
import { type RowsEstimationContext } from 'src/engine/api/common/common-query-runners/types/rows-estimation-context.type';
import { estimateRelationRowsRead } from 'src/engine/api/common/common-query-runners/utils/estimate-relation-rows-read.util';
import { estimateRowsRead } from 'src/engine/api/common/common-query-runners/utils/estimate-rows-read.util';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';

export const estimateFilteredMutationRowsUsage = ({
  filter,
  select,
  context,
}: {
  filter: Partial<ObjectRecordFilter>;
  select: CommonSelectedFields;
  context: RowsEstimationContext;
}): EstimatedRowsUsage => {
  const matchingRowCount = estimateRowsRead({ filter, context });

  return {
    rowsRead:
      matchingRowCount +
      estimateRelationRowsRead({
        select,
        parentRowCount: matchingRowCount,
        context,
      }),
    rowsWritten: matchingRowCount,
  };
};
