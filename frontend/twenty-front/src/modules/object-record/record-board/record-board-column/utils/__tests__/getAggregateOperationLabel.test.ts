import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';

describe('getAggregateOperationLabel', () => {
  it('should return correct labels for each operation', () => {
    expect(getAggregateOperationLabel(AggregateOperations.MIN)).toBe('Min');
    expect(getAggregateOperationLabel(AggregateOperations.MAX)).toBe('Max');
    expect(getAggregateOperationLabel(AggregateOperations.AVG)).toBe('Average');
    expect(getAggregateOperationLabel(DateAggregateOperations.EARLIEST)).toBe(
      'Earliest date',
    );
    expect(getAggregateOperationLabel(DateAggregateOperations.LATEST)).toBe(
      'Latest date',
    );
    expect(getAggregateOperationLabel(AggregateOperations.SUM)).toBe('Sum');
    expect(getAggregateOperationLabel(AggregateOperations.COUNT)).toBe(
      'Count all',
    );
    expect(getAggregateOperationLabel(AggregateOperations.COUNT_EMPTY)).toBe(
      'Count empty',
    );
    expect(
      getAggregateOperationLabel(AggregateOperations.COUNT_NOT_EMPTY),
    ).toBe('Count not empty');
    expect(
      getAggregateOperationLabel(AggregateOperations.COUNT_UNIQUE_VALUES),
    ).toBe('Count unique values');
    expect(
      getAggregateOperationLabel(AggregateOperations.PERCENTAGE_EMPTY),
    ).toBe('Percent empty');
    expect(
      getAggregateOperationLabel(AggregateOperations.PERCENTAGE_NOT_EMPTY),
    ).toBe('Percent not empty');
  });

  it('should throw error for unknown operation', () => {
    expect(() =>
      getAggregateOperationLabel('INVALID' as AggregateOperations),
    ).toThrow('Unknown aggregate operation: INVALID');
  });
});
