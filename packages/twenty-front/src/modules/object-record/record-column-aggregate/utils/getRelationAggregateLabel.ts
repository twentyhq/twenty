import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getAggregateLabelWithFieldName } from '@/object-record/record-aggregate/utils/getAggregateLabelWithFieldName';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const getRelationAggregateLabel = ({
  aggregateOperation,
  aggregatedFieldMetadataItem,
}: {
  aggregateOperation: ExtendedAggregateOperations;
  aggregatedFieldMetadataItem: FieldMetadataItem | undefined;
}) =>
  isDefined(aggregatedFieldMetadataItem)
    ? getAggregateLabelWithFieldName({
        aggregateFieldMetadataItem: aggregatedFieldMetadataItem,
        aggregateOperation,
      })
    : t`Count`;
