import { FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldsAvailableByAggregateOperation';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';

export const initializeAvailableFieldsForAggregateOperationMap =
  (): AvailableFieldsForAggregateOperation => {
    return Object.keys(FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION).reduce(
      (acc, operation) => ({
        ...acc,
        [operation]: [],
      }),
      {},
    );
  };
