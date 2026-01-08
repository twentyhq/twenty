import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { getPageLayoutTabListInitialActiveTabId } from '@/page-layout/utils/getPageLayoutTabListInitialActiveTabId';

describe('getPageLayoutTabListInitialActiveTabId', () => {
  const createMockTab = (id: string): PageLayoutTab => ({
    id,
    pageLayoutId: 'page-layout-1',
    title: `Tab ${id}`,
    position: 0,
    widgets: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  });

  const mockTabs: PageLayoutTab[] = [
    createMockTab('tab-1'),
    createMockTab('tab-2'),
    createMockTab('tab-3'),
  ];

  describe('when activeTabId exists in tabs', () => {
    it('should return activeTabId regardless of context', () => {
      const result = getPageLayoutTabListInitialActiveTabId({
        activeTabId: 'tab-2',
        tabs: mockTabs,
        defaultTabIdToFocusOnMobileAndSidePanel: 'tab-3',
        isMobile: true,
        isInRightDrawer: true,
      });

      expect(result).toBe('tab-2');
    });

    it('should return activeTabId even when not on mobile or in drawer', () => {
      const result = getPageLayoutTabListInitialActiveTabId({
        activeTabId: 'tab-1',
        tabs: mockTabs,
        defaultTabIdToFocusOnMobileAndSidePanel: 'tab-3',
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result).toBe('tab-1');
    });
  });

  describe('when activeTabId does not exist in tabs', () => {
    describe('on mobile or in right drawer', () => {
      it('should return defaultTabIdToFocusOnMobileAndSidePanel when on mobile and default exists', () => {
        const result = getPageLayoutTabListInitialActiveTabId({
          activeTabId: 'non-existent-tab',
          tabs: mockTabs,
          defaultTabIdToFocusOnMobileAndSidePanel: 'tab-3',
          isMobile: true,
          isInRightDrawer: false,
        });

        expect(result).toBe('tab-3');
      });

      it('should return defaultTabIdToFocusOnMobileAndSidePanel when in right drawer and default exists', () => {
        const result = getPageLayoutTabListInitialActiveTabId({
          activeTabId: null,
          tabs: mockTabs,
          defaultTabIdToFocusOnMobileAndSidePanel: 'tab-2',
          isMobile: false,
          isInRightDrawer: true,
        });

        expect(result).toBe('tab-2');
      });

      it('should return defaultTabIdToFocusOnMobileAndSidePanel when on mobile and in right drawer', () => {
        const result = getPageLayoutTabListInitialActiveTabId({
          activeTabId: null,
          tabs: mockTabs,
          defaultTabIdToFocusOnMobileAndSidePanel: 'tab-1',
          isMobile: true,
          isInRightDrawer: true,
        });

        expect(result).toBe('tab-1');
      });

      it('should fallback to first tab when defaultTabIdToFocusOnMobileAndSidePanel does not exist', () => {
        const result = getPageLayoutTabListInitialActiveTabId({
          activeTabId: null,
          tabs: mockTabs,
          defaultTabIdToFocusOnMobileAndSidePanel: 'non-existent-tab',
          isMobile: true,
          isInRightDrawer: false,
        });

        expect(result).toBe('tab-1');
      });

      it('should fallback to first tab when defaultTabIdToFocusOnMobileAndSidePanel is undefined', () => {
        const result = getPageLayoutTabListInitialActiveTabId({
          activeTabId: null,
          tabs: mockTabs,
          defaultTabIdToFocusOnMobileAndSidePanel: undefined,
          isMobile: true,
          isInRightDrawer: false,
        });

        expect(result).toBe('tab-1');
      });
    });

    describe('not on mobile and not in right drawer', () => {
      it('should return first tab when default is provided', () => {
        const result = getPageLayoutTabListInitialActiveTabId({
          activeTabId: null,
          tabs: mockTabs,
          defaultTabIdToFocusOnMobileAndSidePanel: 'tab-3',
          isMobile: false,
          isInRightDrawer: false,
        });

        expect(result).toBe('tab-1');
      });

      it('should return first tab when default is not provided', () => {
        const result = getPageLayoutTabListInitialActiveTabId({
          activeTabId: null,
          tabs: mockTabs,
          defaultTabIdToFocusOnMobileAndSidePanel: undefined,
          isMobile: false,
          isInRightDrawer: false,
        });

        expect(result).toBe('tab-1');
      });
    });
  });

  describe('edge cases', () => {
    it('should return null when tabs array is empty', () => {
      const result = getPageLayoutTabListInitialActiveTabId({
        activeTabId: null,
        tabs: [],
        defaultTabIdToFocusOnMobileAndSidePanel: 'tab-1',
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result).toBe(null);
    });

    it('should return null when tabs array is empty even with default on mobile', () => {
      const result = getPageLayoutTabListInitialActiveTabId({
        activeTabId: null,
        tabs: [],
        defaultTabIdToFocusOnMobileAndSidePanel: 'tab-1',
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result).toBe(null);
    });

    it('should handle activeTabId being null', () => {
      const result = getPageLayoutTabListInitialActiveTabId({
        activeTabId: null,
        tabs: mockTabs,
        defaultTabIdToFocusOnMobileAndSidePanel: undefined,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result).toBe('tab-1');
    });

    it('should handle single tab array', () => {
      const singleTab = [createMockTab('only-tab')];

      const result = getPageLayoutTabListInitialActiveTabId({
        activeTabId: null,
        tabs: singleTab,
        defaultTabIdToFocusOnMobileAndSidePanel: undefined,
        isMobile: false,
        isInRightDrawer: false,
      });

      expect(result).toBe('only-tab');
    });
  });

  describe('priority order', () => {
    it('should prioritize activeTabId over default and context', () => {
      const result = getPageLayoutTabListInitialActiveTabId({
        activeTabId: 'tab-1',
        tabs: mockTabs,
        defaultTabIdToFocusOnMobileAndSidePanel: 'tab-2',
        isMobile: true,
        isInRightDrawer: true,
      });

      expect(result).toBe('tab-1');
    });

    it('should prioritize valid default over first tab when on mobile', () => {
      const result = getPageLayoutTabListInitialActiveTabId({
        activeTabId: 'non-existent',
        tabs: mockTabs,
        defaultTabIdToFocusOnMobileAndSidePanel: 'tab-3',
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result).toBe('tab-3');
    });

    it('should fallback to first tab when default is invalid on mobile', () => {
      const result = getPageLayoutTabListInitialActiveTabId({
        activeTabId: 'non-existent',
        tabs: mockTabs,
        defaultTabIdToFocusOnMobileAndSidePanel: 'invalid-tab',
        isMobile: true,
        isInRightDrawer: false,
      });

      expect(result).toBe('tab-1');
    });
  });
});
