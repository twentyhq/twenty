import { getAggregateLabelWithFieldName } from '@/object-record/record-aggregate/utils/getAggregateLabelWithFieldName';
import { type RecordFieldSummary } from '@/object-record/record-column-summary/types/RecordFieldSummary';
import { t } from '@lingui/core/macro';
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
    : t`Count`;
