import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';

describe('getAggregateOperationLabel', () => {
  it('should return correct labels for each operation', () => {
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.min)).toBe('Min');
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.max)).toBe('Max');
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.avg)).toBe(
      'Average',
    );
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.sum)).toBe('Sum');
    expect(getAggregateOperationLabel(AGGREGATE_OPERATIONS.count)).toBe(
      'Count',
    );
  });

  it('should throw error for unknown operation', () => {
    expect(() =>
      getAggregateOperationLabel('INVALID' as AGGREGATE_OPERATIONS),
    ).toThrow('Unknown aggregate operation: INVALID');
  });
});
