import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLookupTargetFieldMetadataItems } from '@/object-record/record-column-lookup/utils/getLookupTargetFieldMetadataItems';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/NonStandardAggregateOperationsOptions';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

// The server summarizes a related field only with min, max, average and sum; operations no field supports are left out
export const getSummaryFieldMetadataItemsByOperation = (
  relationObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'readableFields'
  >,
): Partial<Record<AggregateOperations, FieldMetadataItem[]>> =>
  Object.fromEntries(
    NON_STANDARD_AGGREGATE_OPERATION_OPTIONS.flatMap((aggregateOperation) => {
      const fieldMetadataItems = getLookupTargetFieldMetadataItems(
        relationObjectMetadataItem,
      ).filter((fieldMetadataItem) =>
        isDefined(
          getAvailableAggregationsFromObjectFields([fieldMetadataItem])[
            fieldMetadataItem.name
          ]?.[
            convertAggregateOperationToExtendedAggregateOperation(
              aggregateOperation,
              fieldMetadataItem.type,
            )
          ],
        ),
      );

      return isNonEmptyArray(fieldMetadataItems)
        ? [[aggregateOperation, fieldMetadataItems]]
        : [];
    }),
  );
