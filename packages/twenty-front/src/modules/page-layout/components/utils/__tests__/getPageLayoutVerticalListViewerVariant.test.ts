import { getPageLayoutVerticalListViewerVariant } from '@/page-layout/components/utils/getPageLayoutVerticalListViewerVariant';

describe('getPageLayoutVerticalListViewerVariant', () => {
  it('should return side-column when isInPinnedTab is true', () => {
    expect(
      getPageLayoutVerticalListViewerVariant({
        isInPinnedTab: true,
        isMobile: false,
        isInSidePanel: false,
      }),
    ).toBe('side-column');
  });

  it('should return side-column when isMobile is true', () => {
    expect(
      getPageLayoutVerticalListViewerVariant({
        isInPinnedTab: false,
        isMobile: true,
        isInSidePanel: false,
      }),
    ).toBe('side-column');
  });

  it('should return side-column when isInSidePanel is true', () => {
    expect(
      getPageLayoutVerticalListViewerVariant({
        isInPinnedTab: false,
        isMobile: false,
        isInSidePanel: true,
      }),
    ).toBe('side-column');
  });

  it('should return default when none of the conditions are true', () => {
    expect(
      getPageLayoutVerticalListViewerVariant({
        isInPinnedTab: false,
        isMobile: false,
        isInSidePanel: false,
      }),
    ).toBe('default');
  });
});
