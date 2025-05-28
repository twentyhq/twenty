import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { expect } from '@storybook/test';

describe('getAggregateOperationLabel', () => {
  it('should return correct labels for each operation', () => {
    expect(getAggregateOperationLabel(AggregateOperations.min)).toBe('Min');
    expect(getAggregateOperationLabel(AggregateOperations.max)).toBe('Max');
    expect(getAggregateOperationLabel(AggregateOperations.avg)).toBe(
      'Average',
    );
    expect(getAggregateOperationLabel(DATE_AggregateOperations.earliest)).toBe(
      'Earliest date',
    );
    expect(getAggregateOperationLabel(DATE_AggregateOperations.latest)).toBe(
      'Latest date',
    );
    expect(getAggregateOperationLabel(AggregateOperations.sum)).toBe('Sum');
    expect(getAggregateOperationLabel(AggregateOperations.count)).toBe(
      'Count all',
    );
    expect(getAggregateOperationLabel(AggregateOperations.countEmpty)).toBe(
      'Count empty',
    );
    expect(getAggregateOperationLabel(AggregateOperations.countNotEmpty)).toBe(
      'Count not empty',
    );
    expect(
      getAggregateOperationLabel(AggregateOperations.countUniqueValues),
    ).toBe('Count unique values');
    expect(
      getAggregateOperationLabel(AggregateOperations.percentageEmpty),
    ).toBe('Percent empty');
    expect(
      getAggregateOperationLabel(AggregateOperations.percentageNotEmpty),
    ).toBe('Percent not empty');
  });

  it('should throw error for unknown operation', () => {
    expect(() =>
      getAggregateOperationLabel('INVALID' as AggregateOperations),
    ).toThrow('Unknown aggregate operation: INVALID');
  });
});
