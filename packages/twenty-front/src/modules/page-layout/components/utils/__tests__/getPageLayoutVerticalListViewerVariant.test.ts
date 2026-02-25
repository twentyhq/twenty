import { getPageLayoutVerticalListViewerVariant } from '@/page-layout/components/utils/getPageLayoutVerticalListViewerVariant';

describe('getPageLayoutVerticalListViewerVariant', () => {
  it('should return side-column when isInPinnedTab is true', () => {
    expect(
      getPageLayoutVerticalListViewerVariant({
        isInPinnedTab: true,
        isMobile: false,
        isInRightDrawer: false,
      }),
    ).toBe('side-column');
  });

  it('should return side-column when isMobile is true', () => {
    expect(
      getPageLayoutVerticalListViewerVariant({
        isInPinnedTab: false,
        isMobile: true,
        isInRightDrawer: false,
      }),
    ).toBe('side-column');
  });

  it('should return side-column when isInRightDrawer is true', () => {
    expect(
      getPageLayoutVerticalListViewerVariant({
        isInPinnedTab: false,
        isMobile: false,
        isInRightDrawer: true,
      }),
    ).toBe('side-column');
  });

  it('should return default when none of the conditions are true', () => {
    expect(
      getPageLayoutVerticalListViewerVariant({
        isInPinnedTab: false,
        isMobile: false,
        isInRightDrawer: false,
      }),
    ).toBe('default');
  });
});
