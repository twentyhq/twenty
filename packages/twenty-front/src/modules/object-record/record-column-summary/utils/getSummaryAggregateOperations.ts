import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/NonStandardAggregateOperationsOptions';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { isDefined } from 'twenty-shared/utils';

// The server summarizes a related field only with min, max, average and sum; Count takes no field
export const getSummaryAggregateOperations = (
  fieldMetadataItem: FieldMetadataItem,
) => {
  const availableAggregations =
    getAvailableAggregationsFromObjectFields([fieldMetadataItem])[
      fieldMetadataItem.name
    ] ?? {};

  return NON_STANDARD_AGGREGATE_OPERATION_OPTIONS.filter((aggregateOperation) =>
    isDefined(
      availableAggregations[
        convertAggregateOperationToExtendedAggregateOperation(
          aggregateOperation,
          fieldMetadataItem.type,
        )
      ],
    ),
  );
};
