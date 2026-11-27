import { getAggregateLabelWithFieldName } from '@/object-record/record-aggregate/utils/getAggregateLabelWithFieldName';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { isDefined } from 'twenty-shared/utils';

export const getRecordFieldSummaryLabel = ({
  aggregateOperation,
  aggregatedFieldMetadataItem,
}: Pick<
  RecordFieldSummary,
  'aggregateOperation' | 'aggregatedFieldMetadataItem'
>) =>
  isDefined(aggregatedFieldMetadataItem)
    ? getAggregateLabelWithFieldName({
        aggregateFieldMetadataItem: aggregatedFieldMetadataItem,
        aggregateOperation,
      })
    : getAggregateOperationLabel(AggregateOperations.COUNT);
