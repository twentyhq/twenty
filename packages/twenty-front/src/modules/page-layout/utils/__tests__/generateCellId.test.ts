import { generateCellId } from '@/page-layout/utils/generateCellId';

describe('generateCellId', () => {
  it('should generate cell ID with correct format', () => {
    expect(generateCellId(3, 5)).toBe('cell-3-5');
  });

  it('should handle zero values', () => {
    expect(generateCellId(0, 0)).toBe('cell-0-0');
  });

  it('should handle large numbers', () => {
    expect(generateCellId(100, 200)).toBe('cell-100-200');
  });
});
