import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATES_AGGREGATE_OPERATION_OPTIONS_WITH_LABELS } from '@/object-record/record-table/record-table-footer/constants/datesAggregateOperationOptionsWithLabels';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { isFieldMetadataDateKind } from 'twenty-shared';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const convertAggregateOperationToExtendedAggregateOperation = (
  aggregateOperation: AGGREGATE_OPERATIONS,
  fieldType?: FieldMetadataType,
): ExtendedAggregateOperations => {
  if (isFieldMetadataDateKind(fieldType) === true) {
    return DATES_AGGREGATE_OPERATION_OPTIONS_WITH_LABELS[
      aggregateOperation as 'MIN' | 'MAX'
    ] as ExtendedAggregateOperations;
  }
  return aggregateOperation;
};
