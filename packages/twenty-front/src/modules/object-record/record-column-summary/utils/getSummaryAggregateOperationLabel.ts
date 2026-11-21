import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { t } from '@lingui/core/macro';

// The footer says Count all because it can also count empty values; a summary only counts records
export const getSummaryAggregateOperationLabel = (
  aggregateOperation: AggregateOperations,
) =>
  aggregateOperation === AggregateOperations.COUNT
    ? t`Count`
    : getAggregateOperationLabel(aggregateOperation);
