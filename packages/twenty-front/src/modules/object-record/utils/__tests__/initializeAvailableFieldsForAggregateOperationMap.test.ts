import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION } from '@/object-record/record-table/constants/FieldsAvailableByAggregateOperation';
import { AggregateOperationsOmittingCount } from '@/object-record/types/AggregateOperationsOmittingCount';
import { initializeAvailableFieldsForAggregateOperationMap } from '@/object-record/utils/initializeAvailableFieldsForAggregateOperationMap';

describe('initializeAvailableFieldsForAggregateOperationMap', () => {
  it('should initialize empty arrays for each aggregate operation', () => {
    const result = initializeAvailableFieldsForAggregateOperationMap();

    expect(Object.keys(result)).toEqual(
      Object.keys(FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION),
    );
    Object.values(result).forEach((array) => {
      expect(array).toEqual([]);
    });
  });

  it('should not include count operation', () => {
    const result = initializeAvailableFieldsForAggregateOperationMap();
    expect(
      result[AGGREGATE_OPERATIONS.count as AggregateOperationsOmittingCount],
    ).toBeUndefined();
  });
});
