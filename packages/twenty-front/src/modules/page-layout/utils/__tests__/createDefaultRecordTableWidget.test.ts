import { createDefaultRecordTableWidget } from '@/page-layout/utils/createDefaultRecordTableWidget';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('createDefaultRecordTableWidget', () => {
  const widgetId = 'widget-id-1';
  const pageLayoutTabId = 'tab-id-1';
  const title = 'My Record Table';
  const gridPosition = { row: 1, column: 2, rowSpan: 3, columnSpan: 4 };

  const widget = createDefaultRecordTableWidget({
    id: widgetId,
    pageLayoutTabId,
    title,
    gridPosition,
  });

  it('should return correct shape with all required fields', () => {
    expect(widget.__typename).toBe('PageLayoutWidget');
    expect(widget.id).toBe(widgetId);
    expect(widget.pageLayoutTabId).toBe(pageLayoutTabId);
    expect(widget.title).toBe(title);
    expect(widget.createdAt).toBeDefined();
    expect(widget.updatedAt).toBeDefined();
    expect(widget.deletedAt).toBeNull();
  });

  it('should set type to WidgetType.RECORD_TABLE', () => {
    expect(widget.type).toBe(WidgetType.RECORD_TABLE);
  });

  it('should set configuration.configurationType to WidgetConfigurationType.RECORD_TABLE', () => {
    expect(widget.configuration).toEqual({
      configurationType: WidgetConfigurationType.RECORD_TABLE,
    });
  });

  it('should correctly map grid position values to both gridPosition and position fields', () => {
    expect(widget.gridPosition).toEqual(gridPosition);
    expect(widget.position).toEqual({
      __typename: 'PageLayoutWidgetGridPosition',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: gridPosition.row,
      column: gridPosition.column,
      rowSpan: gridPosition.rowSpan,
      columnSpan: gridPosition.columnSpan,
    });
  });

  it('should set objectMetadataId to null', () => {
    expect(widget.objectMetadataId).toBeNull();
  });
});
