import { computeNewEvenlySpacedPositions } from '@/object-record/utils/computeNewEvenlySpacedPositions';

describe('computeNewEvenlySpacedPositions', () => {
  it('should compute evenly spaced positions between two values', () => {
    const result = computeNewEvenlySpacedPositions({
      startingPosition: 0,
      endingPosition: 10,
      numberOfRecordsToInsertBetween: 4,
    });

    expect(result).toEqual([2, 4, 6, 8]);
  });

  it('should return a single midpoint when inserting one record', () => {
    const result = computeNewEvenlySpacedPositions({
      startingPosition: 0,
      endingPosition: 10,
      numberOfRecordsToInsertBetween: 1,
    });

    expect(result).toEqual([5]);
  });

  it('should return all same values when gap is zero', () => {
    const result = computeNewEvenlySpacedPositions({
      startingPosition: 5,
      endingPosition: 5,
      numberOfRecordsToInsertBetween: 3,
    });

    expect(result).toEqual([5, 5, 5]);
  });

  it('should throw when starting position is after ending position', () => {
    expect(() =>
      computeNewEvenlySpacedPositions({
        startingPosition: 10,
        endingPosition: 5,
        numberOfRecordsToInsertBetween: 1,
      }),
    ).toThrow();
  });
});
