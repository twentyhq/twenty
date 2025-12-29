import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { PageLayoutType } from '~/generated/graphql';
import { getTabsByDisplayMode } from '@/page-layout/utils/getTabsByDisplayMode';

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
    it('should return all tabs in tabsToRenderInTabList', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2'),
        createMockTab('tab-3'),
      ];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result.tabsToRenderInTabList).toEqual(tabs);
      expect(result.tabsToRenderInTabList).toHaveLength(3);
    });

    it('should return undefined for pinnedLeftTab', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result.pinnedLeftTab).toBeUndefined();
    });

    it('should handle empty tabs array', () => {
      const pageLayout = createMockPageLayout([]);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result.tabsToRenderInTabList).toEqual([]);
      expect(result.pinnedLeftTab).toBeUndefined();
    });

    it('should return all tabs including the first one', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result.tabsToRenderInTabList).toEqual(tabs);
      expect(result.tabsToRenderInTabList).toHaveLength(2);
    });
  });

  describe('when isInRightDrawer is true', () => {
    it('should return all tabs in tabsToRenderInTabList', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2'),
        createMockTab('tab-3'),
      ];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: true,
      });

      expect(result.tabsToRenderInTabList).toEqual(tabs);
      expect(result.tabsToRenderInTabList).toHaveLength(3);
    });

    it('should return undefined for pinnedLeftTab', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: true,
      });

      expect(result.pinnedLeftTab).toBeUndefined();
    });

    it('should handle empty tabs array', () => {
      const pageLayout = createMockPageLayout([]);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: true,
      });

      expect(result.tabsToRenderInTabList).toEqual([]);
      expect(result.pinnedLeftTab).toBeUndefined();
    });

    it('should return all tabs including the first one', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: true,
      });

      expect(result.tabsToRenderInTabList).toEqual(tabs);
      expect(result.tabsToRenderInTabList).toHaveLength(2);
    });
  });

  describe('when isMobile is false and isInRightDrawer is false', () => {
    it('should return first tab as pinnedLeftTab and rest in tabsToRenderInTabList', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2'),
        createMockTab('tab-3'),
      ];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result.pinnedLeftTab).toBeDefined();
      expect(result.pinnedLeftTab?.id).toBe('tab-1');
      expect(result.tabsToRenderInTabList).toHaveLength(2);
      expect(result.tabsToRenderInTabList).toEqual([tabs[1], tabs[2]]);
    });

    it('should return first tab as pinnedLeftTab', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2'),
        createMockTab('tab-3'),
      ];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result.pinnedLeftTab).toBeDefined();
      expect(result.pinnedLeftTab?.id).toBe('tab-1');
    });

    it('should return undefined for pinnedLeftTab when no tabs exist', () => {
      const pageLayout = createMockPageLayout([]);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result.pinnedLeftTab).toBeUndefined();
      expect(result.tabsToRenderInTabList).toEqual([]);
    });

    it('should handle single tab', () => {
      const tabs = [createMockTab('tab-1')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result.pinnedLeftTab).toBeUndefined();
      expect(result.tabsToRenderInTabList).toEqual(tabs);
      expect(result.tabsToRenderInTabList).toHaveLength(1);
    });

    it('should handle empty tabs array', () => {
      const pageLayout = createMockPageLayout([]);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result.tabsToRenderInTabList).toEqual([]);
      expect(result.pinnedLeftTab).toBeUndefined();
    });

    it('should handle two tabs', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result.pinnedLeftTab?.id).toBe('tab-1');
      expect(result.tabsToRenderInTabList).toHaveLength(1);
      expect(result.tabsToRenderInTabList[0].id).toBe('tab-2');
    });
  });

  describe('edge cases', () => {
    it('should handle single tab without pinned-left display mode', () => {
      const tabs = [createMockTab('tab-1')];
      const pageLayout = createMockPageLayout(tabs);

      const resultMobile = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: true,
        isInRightDrawer: false,
      });
      const resultDesktop = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(resultMobile.tabsToRenderInTabList).toEqual(tabs);
      expect(resultMobile.pinnedLeftTab).toBeUndefined();

      expect(resultDesktop.tabsToRenderInTabList).toEqual(tabs);
      expect(resultDesktop.pinnedLeftTab).toBeUndefined();
    });

    it('should handle single tab with pinned-left display mode', () => {
      const tabs = [createMockTab('tab-1')];
      const pageLayout = createMockPageLayout(tabs);

      const resultMobile = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: true,
        isInRightDrawer: false,
      });
      const resultDesktop = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(resultMobile.tabsToRenderInTabList).toEqual(tabs);
      expect(resultMobile.pinnedLeftTab).toBeUndefined();

      expect(resultDesktop.tabsToRenderInTabList).toEqual(tabs);
      expect(resultDesktop.pinnedLeftTab).toBeUndefined();
    });

    it('should not mutate the original page layout', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);
      const originalTabsLength = pageLayout.tabs.length;

      getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
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
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result.pinnedLeftTab).toBeUndefined();
      expect(result.tabsToRenderInTabList[0]?.layoutMode).toBe('grid');
    });
  });

  describe('consistency between mobile and desktop', () => {
    it('should return consistent results for the same input', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const result1 = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });
      const result2 = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result1).toEqual(result2);
    });

    it('should show different results for mobile vs desktop', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const mobileResult = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: true,
        isInRightDrawer: false,
      });
      const desktopResult = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(mobileResult.tabsToRenderInTabList.length).toBe(2);
      expect(desktopResult.tabsToRenderInTabList.length).toBe(1);

      expect(mobileResult.pinnedLeftTab).toBeUndefined();
      expect(desktopResult.pinnedLeftTab).toBeDefined();
    });

    it('should show same results for mobile vs desktop when single tab', () => {
      const tabs = [createMockTab('tab-1')];
      const pageLayout = createMockPageLayout(tabs);

      const mobileResult = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: true,
        isInRightDrawer: false,
      });
      const desktopResult = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(mobileResult.tabsToRenderInTabList).toEqual(tabs);
      expect(desktopResult.tabsToRenderInTabList).toEqual(tabs);

      expect(mobileResult.pinnedLeftTab).toBeUndefined();
      expect(desktopResult.pinnedLeftTab).toBeUndefined();
    });
  });

  describe('when both isMobile and isInRightDrawer are true', () => {
    it('should behave the same as when only one is true', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];
      const pageLayout = createMockPageLayout(tabs);

      const resultBothTrue = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: true,
        isInRightDrawer: true,
      });
      const resultOnlyMobile = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: true,
        isInRightDrawer: false,
      });
      const resultOnlyRightDrawer = getTabsByDisplayMode({
        tabs: pageLayout.tabs,
        pageLayoutType: pageLayout.type,
        isMobile: false,
        isInRightDrawer: true,
      });

      expect(resultBothTrue).toEqual(resultOnlyMobile);
      expect(resultBothTrue).toEqual(resultOnlyRightDrawer);
      expect(resultBothTrue.tabsToRenderInTabList).toEqual(tabs);
      expect(resultBothTrue.pinnedLeftTab).toBeUndefined();
    });
  });
});
