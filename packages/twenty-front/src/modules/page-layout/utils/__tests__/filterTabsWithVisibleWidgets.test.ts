import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { WidgetType } from '~/generated/graphql';
import { filterTabsWithVisibleWidgets } from '../filterTabsWithVisibleWidgets';

describe('filterTabsWithVisibleWidgets', () => {
  const createMockWidget = (
    id: string,
    conditionalDisplay?: any,
  ): PageLayoutTab['widgets'][0] => ({
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId: 'tab-1',
    title: `Widget ${id}`,
    type: WidgetType.FIELDS,
    objectMetadataId: null,
    gridPosition: {
      __typename: 'GridPosition',
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 1,
    },
    configuration: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    conditionalDisplay,
  });

  const createMockTab = (
    id: string,
    widgets: PageLayoutTab['widgets'],
  ): PageLayoutTab => ({
    __typename: 'PageLayoutTab',
    id,
    pageLayoutId: 'page-layout-1',
    title: `Tab ${id}`,
    position: 0,
    widgets,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
  });

  describe('in read mode', () => {
    it('should remove tabs with no visible widgets', () => {
      const tabs = [
        createMockTab('tab-1', [createMockWidget('widget-1')]),
        createMockTab('tab-2', [
          createMockWidget('widget-2', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
        createMockTab('tab-3', [createMockWidget('widget-3')]),
      ];

      const result = filterTabsWithVisibleWidgets({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: false,
      });

      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toEqual(['tab-1', 'tab-3']);
    });

    it('should keep tabs with at least one visible widget', () => {
      const tabs = [
        createMockTab('tab-1', [
          createMockWidget('widget-1'),
          createMockWidget('widget-2', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
      ];

      const result = filterTabsWithVisibleWidgets({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].widgets).toHaveLength(1);
      expect(result[0].widgets[0].id).toBe('widget-1');
    });

    it('should return empty array when all tabs have no visible widgets', () => {
      const tabs = [
        createMockTab('tab-1', [
          createMockWidget('widget-1', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
        createMockTab('tab-2', [
          createMockWidget('widget-2', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
      ];

      const result = filterTabsWithVisibleWidgets({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: false,
      });

      expect(result).toHaveLength(0);
    });

    it('should handle tabs with no widgets', () => {
      const tabs = [
        createMockTab('tab-1', []),
        createMockTab('tab-2', [createMockWidget('widget-2')]),
      ];

      const result = filterTabsWithVisibleWidgets({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: false,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('tab-2');
    });
  });

  describe('in edit mode', () => {
    it('should keep all tabs even if they have no visible widgets', () => {
      const tabs = [
        createMockTab('tab-1', [createMockWidget('widget-1')]),
        createMockTab('tab-2', [
          createMockWidget('widget-2', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
        createMockTab('tab-3', [createMockWidget('widget-3')]),
      ];

      const result = filterTabsWithVisibleWidgets({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: true,
      });

      expect(result).toHaveLength(3);
      expect(result.map((t) => t.id)).toEqual(['tab-1', 'tab-2', 'tab-3']);
    });

    it('should still filter widgets within tabs', () => {
      const tabs = [
        createMockTab('tab-1', [
          createMockWidget('widget-1'),
          createMockWidget('widget-2', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
      ];

      const result = filterTabsWithVisibleWidgets({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].widgets).toHaveLength(1);
      expect(result[0].widgets[0].id).toBe('widget-1');
    });

    it('should keep tabs with no widgets', () => {
      const tabs = [createMockTab('tab-1', []), createMockTab('tab-2', [])];

      const result = filterTabsWithVisibleWidgets({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: true,
      });

      expect(result).toHaveLength(2);
    });

    it('should keep all tabs even when all widgets are hidden', () => {
      const tabs = [
        createMockTab('tab-1', [
          createMockWidget('widget-1', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
        createMockTab('tab-2', [
          createMockWidget('widget-2', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
      ];

      const result = filterTabsWithVisibleWidgets({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: true,
      });

      expect(result).toHaveLength(2);
      expect(result[0].widgets).toHaveLength(0);
      expect(result[1].widgets).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty tabs array', () => {
      const result = filterTabsWithVisibleWidgets({
        tabs: [],
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: false,
      });

      expect(result).toHaveLength(0);
    });

    it('should not mutate the original tabs array', () => {
      const tabs = [
        createMockTab('tab-1', [
          createMockWidget('widget-1', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
      ];
      const originalLength = tabs.length;
      const originalWidgetsLength = tabs[0].widgets.length;

      filterTabsWithVisibleWidgets({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: false,
      });

      expect(tabs).toHaveLength(originalLength);
      expect(tabs[0].widgets).toHaveLength(originalWidgetsLength);
    });

    it('should handle mixed scenarios with multiple widgets per tab', () => {
      const tabs = [
        createMockTab('tab-1', [
          createMockWidget('widget-1'),
          createMockWidget('widget-2'),
          createMockWidget('widget-3', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
        createMockTab('tab-2', [
          createMockWidget('widget-4', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
          createMockWidget('widget-5', {
            and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
          }),
        ]),
        createMockTab('tab-3', [
          createMockWidget('widget-6'),
          createMockWidget('widget-7', {
            and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
          }),
        ]),
      ];

      const result = filterTabsWithVisibleWidgets({
        tabs,
        isMobile: false,
        isInRightDrawer: false,
        isEditMode: false,
      });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('tab-1');
      expect(result[0].widgets).toHaveLength(2);
      expect(result[1].id).toBe('tab-3');
      expect(result[1].widgets).toHaveLength(2);
    });
  });
});
