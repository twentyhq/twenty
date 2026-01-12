import { createEmptySelectGroup } from '@/page-layout/widgets/graph/utils/createEmptySelectGroup';

describe('createEmptySelectGroup', () => {
  it('creates record with correct groupByDimensionValues', () => {
    const result = createEmptySelectGroup(['A'], ['count']);

    expect(result.groupByDimensionValues).toEqual(['A']);
  });

  it('initializes all aggregateKeys to 0', () => {
    const result = createEmptySelectGroup(['A'], ['count']);

    expect(result.count).toBe(0);
  });

  it('handles empty aggregateKeys array', () => {
    const result = createEmptySelectGroup(['A'], []);

    expect(result).toEqual({
      groupByDimensionValues: ['A'],
    });
  });

  it('handles multiple aggregate keys', () => {
    const result = createEmptySelectGroup(['A'], ['count', 'sum', 'avg']);

    expect(result).toEqual({
      groupByDimensionValues: ['A'],
      count: 0,
      sum: 0,
      avg: 0,
    });
  });

  it('handles null values in dimensionValues', () => {
    const result = createEmptySelectGroup(['A', null], ['count']);

    expect(result.groupByDimensionValues).toEqual(['A', null]);
    expect(result.count).toBe(0);
  });

  it('handles multiple dimension values', () => {
    const result = createEmptySelectGroup(['A', 'X', 'Y'], ['count']);

    expect(result.groupByDimensionValues).toEqual(['A', 'X', 'Y']);
    expect(result.count).toBe(0);
  });
});
