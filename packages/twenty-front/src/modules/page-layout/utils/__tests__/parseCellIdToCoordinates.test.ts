import { parseCellIdToCoordinates } from '@/page-layout/utils/parseCellIdToCoordinates';

describe('parseCellIdToCoordinates', () => {
  it('should parse cell ID correctly', () => {
    expect(parseCellIdToCoordinates('cell-3-5')).toEqual({ col: 3, row: 5 });
  });

  it('should handle zero coordinates', () => {
    expect(parseCellIdToCoordinates('cell-0-0')).toEqual({ col: 0, row: 0 });
  });

  it('should handle double-digit coordinates', () => {
    expect(parseCellIdToCoordinates('cell-12-25')).toEqual({
      col: 12,
      row: 25,
    });
  });
});
