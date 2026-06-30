import { GRID_MIN_ROWS } from '@/page-layout/constants/GridMinRows';
import { calculateTotalGridRows } from '@/page-layout/utils/calculateTotalGridRows';

describe('calculateTotalGridRows', () => {
  it('should return minimum rows for empty layouts', () => {
    expect(calculateTotalGridRows({})).toBe(GRID_MIN_ROWS);
  });

  it('should calculate rows based on content when exceeding minimum', () => {
    const layouts = {
      desktop: [
        { i: '1', x: 0, y: 0, w: 2, h: 2 },
        { i: '2', x: 2, y: 20, w: 2, h: 3 },
      ],
    };
    expect(calculateTotalGridRows(layouts)).toBe(33);
  });

  it('should respect minimum rows even with content', () => {
    const layouts = {
      desktop: [{ i: '1', x: 0, y: 0, w: 1, h: 1 }],
    };
    expect(calculateTotalGridRows(layouts)).toBe(GRID_MIN_ROWS);
  });

  it('should handle custom min and buffer values', () => {
    const layouts = {
      desktop: [{ i: '1', x: 0, y: 10, w: 1, h: 5 }],
    };
    expect(calculateTotalGridRows(layouts, 10, 5)).toBe(20);
  });

  it('should consider both desktop and mobile layouts', () => {
    const layouts = {
      desktop: [{ i: '1', x: 0, y: 5, w: 2, h: 2 }],
      mobile: [{ i: '1', x: 0, y: 25, w: 1, h: 3 }],
    };
    expect(calculateTotalGridRows(layouts)).toBe(38);
  });
});
