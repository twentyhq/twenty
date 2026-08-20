import { getIsSideColumnContext } from '@/page-layout/utils/getIsSideColumnContext';

const baseParams = {
  isInPinnedTab: false,
  isMobile: false,
  isInSidePanel: false,
};

describe('getIsSideColumnContext', () => {
  it.each([
    ['isInPinnedTab', { isInPinnedTab: true }],
    ['isMobile', { isMobile: true }],
    ['isInSidePanel', { isInSidePanel: true }],
  ])('should return true when %s is true', (_label, override) => {
    expect(getIsSideColumnContext({ ...baseParams, ...override })).toBe(true);
  });

  it('should return false when none of the conditions are true', () => {
    expect(getIsSideColumnContext(baseParams)).toBe(false);
  });
});
