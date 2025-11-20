import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { reorderTabsForMobileAndSidePanel } from '../reorderTabsForMobileAndSidePanel';

describe('reorderTabsForMobileAndSidePanel', () => {
  const createMockTab = (
    id: string,
    displayAsFirstTabOnMobileAndSidePanel?: boolean,
  ): PageLayoutTab => ({
    id,
    pageLayoutId: 'page-layout-1',
    title: `Tab ${id}`,
    position: 0,
    widgets: [],
    displayAsFirstTabOnMobileAndSidePanel,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  });

  describe('when isMobile is true', () => {
    it('should swap second tab to first position when displayAsFirstTabOnMobileAndSidePanel is true', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2', true),
        createMockTab('tab-3'),
      ];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('tab-2');
      expect(result[1].id).toBe('tab-1');
      expect(result[2].id).toBe('tab-3');
    });

    it('should not reorder when displayAsFirstTabOnMobileAndSidePanel is false', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2', false),
        createMockTab('tab-3'),
      ];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result).toEqual(tabs);
      expect(result[0].id).toBe('tab-1');
      expect(result[1].id).toBe('tab-2');
      expect(result[2].id).toBe('tab-3');
    });

    it('should not reorder when displayAsFirstTabOnMobileAndSidePanel is undefined', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2'),
        createMockTab('tab-3'),
      ];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result).toEqual(tabs);
    });

    it('should handle only two tabs when second tab should be first', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2', true)];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('tab-2');
      expect(result[1].id).toBe('tab-1');
    });

    it('should handle single tab', () => {
      const tabs = [createMockTab('tab-1')];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result).toEqual(tabs);
    });

    it('should handle empty tabs array', () => {
      const result = reorderTabsForMobileAndSidePanel({
        tabs: [],
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result).toEqual([]);
    });
  });

  describe('when isInRightDrawer is true', () => {
    it('should swap second tab to first position when displayAsFirstTabOnMobileAndSidePanel is true', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2', true),
        createMockTab('tab-3'),
      ];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: false,
        isInRightDrawer: true,
      });

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('tab-2');
      expect(result[1].id).toBe('tab-1');
      expect(result[2].id).toBe('tab-3');
    });

    it('should not reorder when displayAsFirstTabOnMobileAndSidePanel is false', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2', false),
        createMockTab('tab-3'),
      ];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: false,
        isInRightDrawer: true,
      });

      expect(result).toEqual(tabs);
    });
  });

  describe('when both isMobile and isInRightDrawer are false', () => {
    it('should not reorder even when displayAsFirstTabOnMobileAndSidePanel is true', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2', true),
        createMockTab('tab-3'),
      ];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result).toEqual(tabs);
      expect(result[0].id).toBe('tab-1');
      expect(result[1].id).toBe('tab-2');
      expect(result[2].id).toBe('tab-3');
    });

    it('should return tabs unchanged', () => {
      const tabs = [createMockTab('tab-1'), createMockTab('tab-2')];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result).toEqual(tabs);
    });
  });

  describe('when both isMobile and isInRightDrawer are true', () => {
    it('should swap second tab to first position when displayAsFirstTabOnMobileAndSidePanel is true', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2', true),
        createMockTab('tab-3'),
      ];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: true,
      });

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('tab-2');
      expect(result[1].id).toBe('tab-1');
      expect(result[2].id).toBe('tab-3');
    });
  });

  describe('edge cases', () => {
    it('should not mutate the original tabs array', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2', true),
        createMockTab('tab-3'),
      ];
      const originalTabs = [...tabs];

      reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(tabs).toEqual(originalTabs);
    });

    it('should handle tabs with additional properties', () => {
      const tabWithExtraProps: PageLayoutTab = {
        ...createMockTab('tab-1'),
        layoutMode: 'grid' as const,
      };
      const tabToSwap: PageLayoutTab = {
        ...createMockTab('tab-2', true),
        layoutMode: 'vertical-list' as const,
      };

      const result = reorderTabsForMobileAndSidePanel({
        tabs: [tabWithExtraProps, tabToSwap],
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result[0].layoutMode).toBe('vertical-list');
      expect(result[1].layoutMode).toBe('grid');
    });

    it('should handle many tabs and only swap first two', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2', true),
        createMockTab('tab-3'),
        createMockTab('tab-4'),
        createMockTab('tab-5'),
      ];

      const result = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result).toHaveLength(5);
      expect(result[0].id).toBe('tab-2');
      expect(result[1].id).toBe('tab-1');
      expect(result[2].id).toBe('tab-3');
      expect(result[3].id).toBe('tab-4');
      expect(result[4].id).toBe('tab-5');
    });
  });

  describe('consistency', () => {
    it('should return consistent results for the same input', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2', true),
        createMockTab('tab-3'),
      ];

      const result1 = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: false,
      });
      const result2 = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result1).toEqual(result2);
    });

    it('should show different results for mobile vs desktop', () => {
      const tabs = [
        createMockTab('tab-1'),
        createMockTab('tab-2', true),
        createMockTab('tab-3'),
      ];

      const mobileResult = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: true,
        isInRightDrawer: false,
      });
      const desktopResult = reorderTabsForMobileAndSidePanel({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(mobileResult[0].id).toBe('tab-2');
      expect(desktopResult[0].id).toBe('tab-1');
    });
  });
});
