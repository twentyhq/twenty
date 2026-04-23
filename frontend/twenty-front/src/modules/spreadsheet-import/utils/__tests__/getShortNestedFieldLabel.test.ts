import { getShortNestedFieldLabel } from '@/spreadsheet-import/utils/getShortNestedFieldLabel';

describe('getShortNestedFieldLabel', () => {
  it('should return everything after the first separator', () => {
    expect(getShortNestedFieldLabel('Address / City')).toBe('City');
  });

  it('should return empty string when there is no separator', () => {
    expect(getShortNestedFieldLabel('Name')).toBe('');
  });

  it('should preserve nested separators after the first one', () => {
    expect(getShortNestedFieldLabel('Address / City / Zip')).toBe('City / Zip');
  });
});
