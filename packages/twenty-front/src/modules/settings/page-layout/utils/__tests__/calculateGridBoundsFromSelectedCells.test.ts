import { calculateGridBoundsFromSelectedCells } from '../calculateGridBoundsFromSelectedCells';

describe('calculateGridBoundsFromSelectedCells', () => {
  it('should return null for empty array', () => {
    expect(calculateGridBoundsFromSelectedCells([])).toBeNull();
  });

  it('should calculate bounds for single cell', () => {
    expect(calculateGridBoundsFromSelectedCells(['cell-2-3'])).toEqual({
      x: 2,
      y: 3,
      w: 1,
      h: 1,
    });
  });

  it('should calculate bounds for rectangular selection', () => {
    expect(
      calculateGridBoundsFromSelectedCells([
        'cell-1-1',
        'cell-2-1',
        'cell-1-2',
        'cell-2-2',
      ]),
    ).toEqual({
      x: 1,
      y: 1,
      w: 2,
      h: 2,
    });
  });

  it('should handle non-contiguous selection', () => {
    expect(
      calculateGridBoundsFromSelectedCells([
        'cell-0-0',
        'cell-5-3',
        'cell-2-1',
      ]),
    ).toEqual({
      x: 0,
      y: 0,
      w: 6,
      h: 4,
    });
  });
});
