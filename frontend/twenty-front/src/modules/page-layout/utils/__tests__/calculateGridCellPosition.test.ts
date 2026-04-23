import { calculateGridCellPosition } from '@/page-layout/utils/calculateGridCellPosition';

describe('calculateGridCellPosition', () => {
  it('should calculate correct position for first cell', () => {
    const result = calculateGridCellPosition({
      index: 0,
      numberOfColumns: 4,
    });

    expect(result).toEqual({ row: 0, column: 0 });
  });

  it('should calculate correct position for cells in first row', () => {
    const result = calculateGridCellPosition({
      index: 3,
      numberOfColumns: 4,
    });

    expect(result).toEqual({ row: 0, column: 3 });
  });

  it('should calculate correct position for cells in subsequent rows', () => {
    const result = calculateGridCellPosition({
      index: 5,
      numberOfColumns: 4,
    });

    expect(result).toEqual({ row: 1, column: 1 });
  });

  it('should handle different column counts', () => {
    const result2Columns = calculateGridCellPosition({
      index: 3,
      numberOfColumns: 2,
    });
    expect(result2Columns).toEqual({ row: 1, column: 1 });

    const result6Columns = calculateGridCellPosition({
      index: 7,
      numberOfColumns: 6,
    });
    expect(result6Columns).toEqual({ row: 1, column: 1 });
  });

  it('should handle large indices', () => {
    const result = calculateGridCellPosition({
      index: 99,
      numberOfColumns: 10,
    });

    expect(result).toEqual({ row: 9, column: 9 });
  });

  it('should handle single column layout', () => {
    const result = calculateGridCellPosition({
      index: 5,
      numberOfColumns: 1,
    });

    expect(result).toEqual({ row: 5, column: 0 });
  });
});
