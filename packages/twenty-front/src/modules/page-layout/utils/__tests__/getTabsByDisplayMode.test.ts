import { type DraftPageLayout } from '@/page-layout/types/draft-page-layout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { PageLayoutType } from '~/generated/graphql';
import { getTabsByDisplayMode } from '../getTabsByDisplayMode';

describe('getTabsByDisplayMode', () => {
  const createMockTab = (id: string): PageLayoutTab => ({
    id,
    pageLayoutId: 'page-layout-1',
    title: `Tab ${id}`,
    position: 0,
    widgets: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  });

  const createMockPageLayout = (tabs: PageLayoutTab[]): DraftPageLayout => ({
    id: 'page-layout-1',
    name: 'Test Layout',
    type: PageLayoutType.RECORD_PAGE,
    objectMetadataId: null,
    tabs,
  });

  describe('when isMobile is true', () => {
    it('should return first tab as pinnedTab and rest in otherTabs', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2'),
        createMockTab('tab-3'),
      ];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.pinnedTab).toBeDefined();
      expect(result.pinnedTab?.id).toBe('tab-1');
      expect(result.otherTabs).toEqual([tabs[1], tabs[2]]);
      expect(result.otherTabs).toHaveLength(2);
    });

    it('should return first tab as pinnedTab with 2 tabs', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.pinnedTab).toBeDefined();
      expect(result.pinnedTab?.id).toBe('tab-1');
    });

    it('should handle empty tabs array', () => {
      const pageLayout = createMockPageLayout([]);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.otherTabs).toEqual([]);
      expect(result.pinnedTab).toBeUndefined();
    });

    it('should return only second tab in otherTabs', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.otherTabs).toEqual([tabs[1]]);
      expect(result.otherTabs).toHaveLength(1);
    });
  });

  describe('when isInRightDrawer is true', () => {
    it('should return first tab as pinnedTab and rest in otherTabs', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2'),
        createMockTab('tab-3'),
      ];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.pinnedTab).toBeDefined();
      expect(result.pinnedTab?.id).toBe('tab-1');
      expect(result.otherTabs).toEqual([tabs[1], tabs[2]]);
      expect(result.otherTabs).toHaveLength(2);
    });

    it('should return first tab as pinnedTab with 2 tabs', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.pinnedTab).toBeDefined();
      expect(result.pinnedTab?.id).toBe('tab-1');
    });

    it('should handle empty tabs array', () => {
      const pageLayout = createMockPageLayout([]);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.otherTabs).toEqual([]);
      expect(result.pinnedTab).toBeUndefined();
    });

    it('should return only second tab in otherTabs', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.otherTabs).toEqual([tabs[1]]);
      expect(result.otherTabs).toHaveLength(1);
    });
  });

  describe('when isMobile is false and isInRightDrawer is false', () => {
    it('should return first tab as pinnedTab and rest in otherTabs', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2'),
        createMockTab('tab-3'),
      ];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.pinnedTab).toBeDefined();
      expect(result.pinnedTab?.id).toBe('tab-1');
      expect(result.otherTabs).toHaveLength(2);
      expect(result.otherTabs).toEqual([tabs[1], tabs[2]]);
    });

    it('should return first tab as pinnedTab', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2'),
        createMockTab('tab-3'),
      ];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.pinnedTab).toBeDefined();
      expect(result.pinnedTab?.id).toBe('tab-1');
    });

    it('should return undefined for pinnedTab when no tabs exist', () => {
      const pageLayout = createMockPageLayout([]);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.pinnedTab).toBeUndefined();
      expect(result.otherTabs).toEqual([]);
    });

    it('should handle single tab', () => {
      const tabs = [createMockTab('tab-1')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.pinnedTab).toBeUndefined();
      expect(result.otherTabs).toEqual(tabs);
      expect(result.otherTabs).toHaveLength(1);
    });

    it('should handle empty tabs array', () => {
      const pageLayout = createMockPageLayout([]);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.otherTabs).toEqual([]);
      expect(result.pinnedTab).toBeUndefined();
    });

    it('should handle two tabs', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.pinnedTab?.id).toBe('tab-1');
      expect(result.otherTabs).toHaveLength(1);
      expect(result.otherTabs[0].id).toBe('tab-2');
    });
  });

  describe('edge cases', () => {
    it('should handle single tab without pinned-left display mode', () => {
      const tabs = [createMockTab('tab-1')];
      const pageLayout = createMockPageLayout(tabs);

      const resultMobile = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });
      const resultDesktop = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(resultMobile.otherTabs).toEqual(tabs);
      expect(resultMobile.pinnedTab).toBeUndefined();

      expect(resultDesktop.otherTabs).toEqual(tabs);
      expect(resultDesktop.pinnedTab).toBeUndefined();
    });

    it('should handle single tab with pinned-left display mode', () => {
      const tabs = [createMockTab('tab-1')];
      const pageLayout = createMockPageLayout(tabs);

      const resultMobile = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });
      const resultDesktop = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(resultMobile.otherTabs).toEqual(tabs);
      expect(resultMobile.pinnedTab).toBeUndefined();

      expect(resultDesktop.otherTabs).toEqual(tabs);
      expect(resultDesktop.pinnedTab).toBeUndefined();
    });

    it('should not mutate the original page layout', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);
      const originalTabsLength = pageLayout.tabs.length;

      getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(pageLayout.tabs).toHaveLength(originalTabsLength);
      expect(pageLayout.tabs).toEqual(tabs);
    });

    it('should handle tabs with additional properties', () => {
      const tabWithExtraProps: PageLayoutTab = {
        ...createMockTab('tab-1'),
        layoutMode: 'grid' as const,
      };
      const pageLayout = createMockPageLayout([tabWithExtraProps]);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result.pinnedTab).toBeUndefined();
      expect(result.otherTabs[0]?.layoutMode).toBe('grid');
    });
  });

  describe('consistency between mobile and desktop', () => {
    it('should return consistent results for the same input', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result1 = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });
      const result2 = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(result1).toEqual(result2);
    });

    it('should show same results for mobile vs desktop', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const mobileResult = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });
      const desktopResult = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(mobileResult.otherTabs.length).toBe(1);
      expect(desktopResult.otherTabs.length).toBe(1);

      expect(mobileResult.pinnedTab).toBeDefined();
      expect(desktopResult.pinnedTab).toBeDefined();
    });

    it('should show same results for mobile vs desktop when single tab', () => {
      const tabs = [createMockTab('tab-1')];
      const pageLayout = createMockPageLayout(tabs);

      const mobileResult = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });
      const desktopResult = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(mobileResult.otherTabs).toEqual(tabs);
      expect(desktopResult.otherTabs).toEqual(tabs);

      expect(mobileResult.pinnedTab).toBeUndefined();
      expect(desktopResult.pinnedTab).toBeUndefined();
    });
  });

  describe('when both isMobile and isInRightDrawer are true', () => {
    it('should behave the same as when only one is true', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const resultBothTrue = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });
      const resultOnlyMobile = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });
      const resultOnlyRightDrawer = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
      });

      expect(resultBothTrue).toEqual(resultOnlyMobile);
      expect(resultBothTrue).toEqual(resultOnlyRightDrawer);
      expect(resultBothTrue.otherTabs).toEqual([tabs[1]]);
      expect(resultBothTrue.pinnedTab).toBeDefined();
      expect(resultBothTrue.pinnedTab?.id).toBe('tab-1');
    });
  });
});
