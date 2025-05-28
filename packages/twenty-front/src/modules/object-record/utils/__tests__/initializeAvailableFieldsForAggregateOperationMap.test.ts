import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
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
      ) as AggregateOperations[],
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
      ) as AggregateOperations[],
    );
    expect(
      result[
        AggregateOperations.count as AggregateOperationsOmittingStandardOperations
      ],
    ).toBeUndefined();
  });

  it('should include count operation when called with count aggregate operations', () => {
    const result = initializeAvailableFieldsForAggregateOperationMap(
      COUNT_AGGREGATE_OPERATION_OPTIONS,
    );
    expect(result[AggregateOperations.count]).toEqual([]);
    expect(result[AggregateOperations.countEmpty]).toEqual([]);
    expect(result[AggregateOperations.countNotEmpty]).toEqual([]);
    expect(result[AggregateOperations.countUniqueValues]).toEqual([]);
    expect(result[AggregateOperations.min]).toBeUndefined();
    expect(result[AggregateOperations.percentageEmpty]).toBeUndefined();
  });

  it('should include percent operation when called with count aggregate operations', () => {
    const result = initializeAvailableFieldsForAggregateOperationMap(
      PERCENT_AGGREGATE_OPERATION_OPTIONS,
    );
    expect(result[AggregateOperations.percentageEmpty]).toEqual([]);
    expect(result[AggregateOperations.percentageNotEmpty]).toEqual([]);
    expect(result[AggregateOperations.count]).toBeUndefined();
    expect(result[AggregateOperations.min]).toBeUndefined();
  });
});
