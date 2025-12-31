import { PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY } from '@/page-layout/constants/PendingWidgetPlaceholderLayoutKey';
import {
  AggregateOperations,
  WidgetConfigurationType,
  WidgetType,
  type PageLayoutWidget,
} from '~/generated/graphql';
import { prepareGridLayoutItemsWithPlaceholders } from '@/page-layout/utils/prepareGridLayoutItemsWithPlaceholders';

describe('prepareGridLayoutItemsWithPlaceholders', () => {
  const createMockWidget = (id: string): PageLayoutWidget => ({
    id,
    pageLayoutTabId: 'tab-1',
    title: `Test Widget ${id}`,
    type: WidgetType.GRAPH,
    objectMetadataId: null,
    gridPosition: {
      row: 0,
      column: 0,
      rowSpan: 2,
      columnSpan: 2,
    },
    configuration: {
      __typename: 'AggregateChartConfiguration',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.COUNT,
      aggregateFieldMetadataId: 'field-id',
      displayDataLabel: false,
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
  });

  describe('empty or undefined widgets', () => {
    it('should return empty placeholder when widgets is undefined', () => {
      const result = prepareGridLayoutItemsWithPlaceholders(undefined, false);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'empty-placeholder',
        type: 'placeholder',
      });
    });

    it('should return empty placeholder when widgets is an empty array', () => {
      const result = prepareGridLayoutItemsWithPlaceholders([], false);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'empty-placeholder',
        type: 'placeholder',
      });
    });

    it('should return pending placeholder when shouldIncludePendingPlaceholder is true and layout is empty', () => {
      const result = prepareGridLayoutItemsWithPlaceholders([], true);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
        type: 'placeholder',
      });
    });
  });

  describe('widgets without pending placeholder', () => {
    it('should return single widget item when given one widget', () => {
      const widget = createMockWidget('widget-1');
      const result = prepareGridLayoutItemsWithPlaceholders([widget], false);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'widget-1',
        type: 'widget',
        widget,
      });
    });

    it('should return multiple widget items when given multiple widgets', () => {
      const widget1 = createMockWidget('widget-1');
      const widget2 = createMockWidget('widget-2');
      const widget3 = createMockWidget('widget-3');
      const widgets = [widget1, widget2, widget3];

      const result = prepareGridLayoutItemsWithPlaceholders(widgets, false);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 'widget-1',
        type: 'widget',
        widget: widget1,
      });
      expect(result[1]).toEqual({
        id: 'widget-2',
        type: 'widget',
        widget: widget2,
      });
      expect(result[2]).toEqual({
        id: 'widget-3',
        type: 'widget',
        widget: widget3,
      });
    });
  });

  describe('widgets with pending placeholder', () => {
    it('should add pending placeholder to single widget', () => {
      const widget = createMockWidget('widget-1');
      const result = prepareGridLayoutItemsWithPlaceholders([widget], true);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'widget-1',
        type: 'widget',
        widget,
      });
      expect(result[1]).toEqual({
        id: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
        type: 'placeholder',
      });
    });

    it('should add pending placeholder after multiple widgets', () => {
      const widget1 = createMockWidget('widget-1');
      const widget2 = createMockWidget('widget-2');
      const widgets = [widget1, widget2];

      const result = prepareGridLayoutItemsWithPlaceholders(widgets, true);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 'widget-1',
        type: 'widget',
        widget: widget1,
      });
      expect(result[1]).toEqual({
        id: 'widget-2',
        type: 'widget',
        widget: widget2,
      });
      expect(result[2]).toEqual({
        id: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
        type: 'placeholder',
      });
    });

    it('should place pending placeholder at the end of the array', () => {
      const widgets = Array.from({ length: 5 }, (_, i) =>
        createMockWidget(`widget-${i + 1}`),
      );

      const result = prepareGridLayoutItemsWithPlaceholders(widgets, true);

      expect(result).toHaveLength(6);
      // Check that the last item is the pending placeholder
      const lastItem = result[result.length - 1];
      expect(lastItem).toEqual({
        id: PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY,
        type: 'placeholder',
      });
      // Check that all other items are widgets
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].type).toBe('widget');
      }
    });
  });

  describe('type and structure verification', () => {
    it('should set correct types for widget items', () => {
      const widget = createMockWidget('widget-1');
      const result = prepareGridLayoutItemsWithPlaceholders([widget], false);

      const item = result[0];
      expect(item.type).toBe('widget');
      expect(item).toHaveProperty('widget');
      expect(item.id).toBe(widget.id);
      if (item.type === 'widget') {
        expect(item.widget).toBe(widget);
      }
    });

    it('should set correct types for placeholder items', () => {
      const result = prepareGridLayoutItemsWithPlaceholders(undefined, false);

      const item = result[0];
      expect(item.type).toBe('placeholder');
      expect(item).not.toHaveProperty('widget');
      expect(item.id).toBe('empty-placeholder');
    });

    it('should set correct types for pending placeholder', () => {
      const widget = createMockWidget('widget-1');
      const result = prepareGridLayoutItemsWithPlaceholders([widget], true);

      const pendingPlaceholder = result[1];
      expect(pendingPlaceholder.type).toBe('placeholder');
      expect(pendingPlaceholder).not.toHaveProperty('widget');
      expect(pendingPlaceholder.id).toBe(PENDING_WIDGET_PLACEHOLDER_LAYOUT_KEY);
    });

    it('should preserve all widget properties', () => {
      const widget = createMockWidget('widget-1');
      const result = prepareGridLayoutItemsWithPlaceholders([widget], false);

      if (result[0].type === 'widget') {
        const resultWidget = result[0].widget;
        expect(resultWidget.id).toBe(widget.id);
        expect(resultWidget.pageLayoutTabId).toBe(widget.pageLayoutTabId);
        expect(resultWidget.title).toBe(widget.title);
        expect(resultWidget.type).toBe(widget.type);
        expect(resultWidget.objectMetadataId).toBe(widget.objectMetadataId);
        expect(resultWidget.gridPosition).toEqual(widget.gridPosition);
        expect(resultWidget.configuration).toEqual(widget.configuration);
        expect(resultWidget.createdAt).toBe(widget.createdAt);
        expect(resultWidget.updatedAt).toBe(widget.updatedAt);
        expect(resultWidget.deletedAt).toBe(widget.deletedAt);
      }
    });
  });

  describe('immutability', () => {
    it('should not mutate the input widgets array', () => {
      const widget1 = createMockWidget('widget-1');
      const widget2 = createMockWidget('widget-2');
      const originalWidgets = [widget1, widget2];
      const widgetsCopy = [...originalWidgets];

      prepareGridLayoutItemsWithPlaceholders(originalWidgets, true);

      // Check that the array wasn't mutated
      expect(originalWidgets).toHaveLength(2);
      expect(originalWidgets).toEqual(widgetsCopy);
      expect(originalWidgets[0]).toBe(widget1);
      expect(originalWidgets[1]).toBe(widget2);
    });

    it('should not mutate individual widget objects', () => {
      const widget = createMockWidget('widget-1');
      const originalWidget = { ...widget };

      prepareGridLayoutItemsWithPlaceholders([widget], true);

      expect(widget).toEqual(originalWidget);
    });

    it('should return a new array instance', () => {
      const widgets = [createMockWidget('widget-1')];
      const result = prepareGridLayoutItemsWithPlaceholders(widgets, false);

      expect(result).not.toBe(widgets);
    });
  });
});
