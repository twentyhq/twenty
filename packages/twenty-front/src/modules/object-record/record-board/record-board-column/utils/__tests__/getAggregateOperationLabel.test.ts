import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { expect } from '@storybook/test';

describe('getAggregateOperationLabel', () => {
  it('should return correct labels for each operation', () => {
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.min)).toBe('Min');
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.max)).toBe('Max');
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.avg)).toBe(
      'Average',
    );
    expect(getAggregateOperationLabel(DATE_AGGREGATE_OPERATIONS.earliest)).toBe(
      'Earliest date',
    );
    expect(getAggregateOperationLabel(DATE_AGGREGATE_OPERATIONS.latest)).toBe(
      'Latest date',
    );
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.sum)).toBe('Sum');
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.count)).toBe(
      'Count all',
    );
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.countEmpty)).toBe(
      'Count empty',
    );
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.countNotEmpty)).toBe(
      'Count not empty',
    );
    expect(
      getAggregateOperationLabel(AGGREGATE_OPERATIONS.countUniqueValues),
    ).toBe('Count unique values');
    expect(
      getAggregateOperationLabel(AGGREGATE_OPERATIONS.percentageEmpty),
    ).toBe('Percent empty');
    expect(
      getAggregateOperationLabel(AGGREGATE_OPERATIONS.percentageNotEmpty),
    ).toBe('Percent not empty');
  });

  it('should throw error for unknown operation', () => {
    expect(() =>
      getAggregateOperationLabel('INVALID' as AGGREGATE_OPERATIONS),
    ).toThrow('Unknown aggregate operation: INVALID');
  });
});
