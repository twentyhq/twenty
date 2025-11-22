import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getAggregateLabelWithFieldName } from '@/object-record/record-aggregate/utils/getAggregateLabelWithFieldName';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { isDefined } from 'twenty-shared/utils';
import { AggregateOperations } from '~/generated/graphql';

type GetRecordIndexAggregateDisplayLabelParams = {
  aggregateOperation: ExtendedAggregateOperations;
  aggregateFieldMetadataItem: FieldMetadataItem;
};

export const getRecordAggregateDisplayLabel = ({
  aggregateFieldMetadataItem,
  aggregateOperation,
}: GetRecordIndexAggregateDisplayLabelParams) => {
  const isCountOperation = aggregateOperation === AggregateOperations.COUNT;

  let aggregateLabel: string | null = null;

  if (isCountOperation) {
    aggregateLabel = `${getAggregateOperationLabel(AggregateOperations.COUNT)}`;
  } else {
    if (isDefined(aggregateFieldMetadataItem)) {
      aggregateLabel = getAggregateLabelWithFieldName({
        aggregateFieldMetadataItem: aggregateFieldMetadataItem,
        aggregateOperation: aggregateOperation,
      });
    }
  }

  return {
    aggregateLabel,
  };
};
