import { getDefaultManualSortOrder } from '@/command-menu/pages/page-layout/utils/getDefaultManualSortOrder';

describe('getDefaultManualSortOrder', () => {
  it('should return empty array for null options', () => {
    expect(getDefaultManualSortOrder(null)).toEqual([]);
  });

  it('should return empty array for undefined options', () => {
    expect(getDefaultManualSortOrder(undefined)).toEqual([]);
  });

  it('should return empty array for empty options', () => {
    expect(getDefaultManualSortOrder([])).toEqual([]);
  });

  it('should return values sorted by position', () => {
    const options = [
      { value: 'third', position: 2 },
      { value: 'first', position: 0 },
      { value: 'second', position: 1 },
    ];

    expect(getDefaultManualSortOrder(options)).toEqual([
      'first',
      'second',
      'third',
    ]);
  });
});
