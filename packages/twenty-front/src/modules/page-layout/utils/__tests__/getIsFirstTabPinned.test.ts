import { getIsFirstTabPinned } from '@/page-layout/utils/getIsFirstTabPinned';

describe('getIsFirstTabPinned', () => {
  it('should return true when the layout pins its first tab', () => {
    expect(getIsFirstTabPinned({ isFirstTabPinned: true })).toBe(true);
  });

  it('should return false when the layout unpinned its first tab', () => {
    expect(getIsFirstTabPinned({ isFirstTabPinned: false })).toBe(false);
  });

  it('should return true for a layout cached before the field existed', () => {
    expect(getIsFirstTabPinned({})).toBe(true);
    expect(getIsFirstTabPinned({ isFirstTabPinned: undefined })).toBe(true);
  });
});
