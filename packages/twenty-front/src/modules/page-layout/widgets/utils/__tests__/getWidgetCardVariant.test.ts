import { getWidgetCardVariant } from '@/page-layout/widgets/utils/getWidgetCardVariant';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

describe('getWidgetCardVariant', () => {
  it('should return dashboard for DASHBOARD page layout type', () => {
    expect(
      getWidgetCardVariant({
        layoutMode: PageLayoutTabLayoutMode.GRID,
        isInPinnedTab: false,
        pageLayoutType: PageLayoutType.DASHBOARD,
        isMobile: false,
        isInSidePanel: false,
      }),
    ).toBe('dashboard');
  });

  it('should return canvas for CANVAS layout mode', () => {
    expect(
      getWidgetCardVariant({
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
        isInPinnedTab: false,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        isMobile: false,
        isInSidePanel: false,
      }),
    ).toBe('canvas');
  });

  it('should return side-column when isInPinnedTab is true', () => {
    expect(
      getWidgetCardVariant({
        layoutMode: PageLayoutTabLayoutMode.GRID,
        isInPinnedTab: true,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        isMobile: false,
        isInSidePanel: false,
      }),
    ).toBe('side-column');
  });

  it('should return side-column when isMobile is true', () => {
    expect(
      getWidgetCardVariant({
        layoutMode: PageLayoutTabLayoutMode.GRID,
        isInPinnedTab: false,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        isMobile: true,
        isInSidePanel: false,
      }),
    ).toBe('side-column');
  });

  it('should return side-column when isInSidePanel is true', () => {
    expect(
      getWidgetCardVariant({
        layoutMode: PageLayoutTabLayoutMode.GRID,
        isInPinnedTab: false,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        isMobile: false,
        isInSidePanel: true,
      }),
    ).toBe('side-column');
  });

  it('should return record-page as default', () => {
    expect(
      getWidgetCardVariant({
        layoutMode: PageLayoutTabLayoutMode.GRID,
        isInPinnedTab: false,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        isMobile: false,
        isInSidePanel: false,
      }),
    ).toBe('record-page');
  });

  it('should prioritize dashboard over canvas', () => {
    expect(
      getWidgetCardVariant({
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
        isInPinnedTab: false,
        pageLayoutType: PageLayoutType.DASHBOARD,
        isMobile: false,
        isInSidePanel: false,
      }),
    ).toBe('dashboard');
  });
});
