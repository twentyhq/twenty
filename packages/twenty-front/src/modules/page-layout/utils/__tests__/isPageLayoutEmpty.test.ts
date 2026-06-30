import { type PageLayout } from '@/page-layout/types/PageLayout';
import { isPageLayoutEmpty } from '@/page-layout/utils/isPageLayoutEmpty';

const createMockLayout = (tabWidgetCounts: number[]): PageLayout =>
  ({
    __typename: 'PageLayout',
    id: 'layout-1',
    tabs: tabWidgetCounts.map((widgetCount, index) => ({
      __typename: 'PageLayoutTab',
      id: `tab-${index}`,
      widgets: Array.from({ length: widgetCount }, (_, i) => ({
        __typename: 'PageLayoutWidget',
        id: `widget-${index}-${i}`,
      })),
    })),
  }) as PageLayout;

describe('isPageLayoutEmpty', () => {
  it('should return true when layout has one tab with no widgets', () => {
    const layout = createMockLayout([0]);

    expect(isPageLayoutEmpty(layout)).toBe(true);
  });

  it('should return false when layout has one tab with widgets', () => {
    const layout = createMockLayout([2]);

    expect(isPageLayoutEmpty(layout)).toBe(false);
  });

  it('should return false when layout has multiple tabs even with no widgets', () => {
    const layout = createMockLayout([0, 0]);

    expect(isPageLayoutEmpty(layout)).toBe(false);
  });

  it('should return false when layout has multiple tabs with widgets', () => {
    const layout = createMockLayout([1, 3]);

    expect(isPageLayoutEmpty(layout)).toBe(false);
  });
});
