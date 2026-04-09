import { calculateGridBoundsFromSelectedCells } from '@/page-layout/utils/calculateGridBoundsFromSelectedCells';

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

  it('should handle large grid selections', () => {
    expect(
      calculateGridBoundsFromSelectedCells(['cell-0-0', 'cell-11-24']),
    ).toEqual({
      x: 0,
      y: 0,
      w: 12,
      h: 25,
    });
  });

  it('should handle single row selection', () => {
    expect(
      calculateGridBoundsFromSelectedCells([
        'cell-0-5',
        'cell-1-5',
        'cell-2-5',
        'cell-3-5',
      ]),
    ).toEqual({
      x: 0,
      y: 5,
      w: 4,
      h: 1,
    });
  });

  it('should handle single column selection', () => {
    expect(
      calculateGridBoundsFromSelectedCells([
        'cell-3-0',
        'cell-3-1',
        'cell-3-2',
        'cell-3-3',
      ]),
    ).toEqual({
      x: 3,
      y: 0,
      w: 1,
      h: 4,
    });
  });

  it('should handle duplicate cell IDs in selection', () => {
    expect(
      calculateGridBoundsFromSelectedCells([
        'cell-1-1',
        'cell-1-1',
        'cell-2-2',
        'cell-2-2',
      ]),
    ).toEqual({
      x: 1,
      y: 1,
      w: 2,
      h: 2,
    });
  });

  it('should handle L-shaped selection', () => {
    expect(
      calculateGridBoundsFromSelectedCells([
        'cell-0-0',
        'cell-1-0',
        'cell-0-1',
        'cell-0-2',
      ]),
    ).toEqual({
      x: 0,
      y: 0,
      w: 2,
      h: 3,
    });
  });

  it('should handle sparse diagonal selection', () => {
    expect(
      calculateGridBoundsFromSelectedCells([
        'cell-0-0',
        'cell-1-1',
        'cell-2-2',
        'cell-3-3',
      ]),
    ).toEqual({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    });
  });
});
