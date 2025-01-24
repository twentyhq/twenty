import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldTypesAvailableForNonStandardAggregateOperation';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { AggregateOperationsOmittingStandardOperations } from '@/object-record/types/AggregateOperationsOmittingStandardOperations';
import { initializeAvailableFieldsForAggregateOperationMap } from '@/object-record/utils/initializeAvailableFieldsForAggregateOperationMap';

describe('initializeAvailableFieldsForAggregateOperationMap', () => {
  it('should initialize empty arrays for each non standard aggregate operation', () => {
    const result = initializeAvailableFieldsForAggregateOperationMap(
      Object.keys(
        FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION,
      ) as AGGREGATE_OPERATIONS[],
    );

    expect(Object.keys(result)).toEqual(
      Object.keys(FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION),
    );
    Object.values(result).forEach((array) => {
      expect(array).toEqual([]);
    });
  });

  it('should not include count operation when called with non standard aggregate operations', () => {
    const result = initializeAvailableFieldsForAggregateOperationMap(
      Object.keys(
        FIELD_TYPES_AVAILABLE_FOR_NON_STANDARD_AGGREGATE_OPERATION,
      ) as AGGREGATE_OPERATIONS[],
    );
    expect(
      result[
        AGGREGATE_OPERATIONS.count as AggregateOperationsOmittingStandardOperations
      ],
    ).toBeUndefined();
  });

  it('should include count operation when called with count aggregate operations', () => {
    const result = initializeAvailableFieldsForAggregateOperationMap(
      COUNT_AGGREGATE_OPERATION_OPTIONS,
    );
    expect(result[AGGREGATE_OPERATIONS.count]).toEqual([]);
    expect(result[AGGREGATE_OPERATIONS.countEmpty]).toEqual([]);
    expect(result[AGGREGATE_OPERATIONS.countNotEmpty]).toEqual([]);
    expect(result[AGGREGATE_OPERATIONS.countUniqueValues]).toEqual([]);
    expect(result[AGGREGATE_OPERATIONS.min]).toBeUndefined();
    expect(result[AGGREGATE_OPERATIONS.percentageEmpty]).toBeUndefined();
  });

  it('should include percent operation when called with count aggregate operations', () => {
    const result = initializeAvailableFieldsForAggregateOperationMap(
      PERCENT_AGGREGATE_OPERATION_OPTIONS,
    );
    expect(result[AGGREGATE_OPERATIONS.percentageEmpty]).toEqual([]);
    expect(result[AGGREGATE_OPERATIONS.percentageNotEmpty]).toEqual([]);
    expect(result[AGGREGATE_OPERATIONS.count]).toBeUndefined();
    expect(result[AGGREGATE_OPERATIONS.min]).toBeUndefined();
  });
});
