import {
  getRecordTableWidgetLayoutViewType,
  RECORD_TABLE_WIDGET_LAYOUT_OPTIONS,
  type RecordTableWidgetLayoutViewType,
} from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
import {
  IconCalendar,
  type IconComponent,
  IconLayoutKanban,
  IconList,
  IconTable,
} from 'twenty-ui/icon';
import { ViewType } from '~/generated-metadata/graphql';

describe('getRecordTableWidgetLayoutViewType', () => {
  it.each([
    ViewType.TABLE_WIDGET,
    ViewType.KANBAN_WIDGET,
    ViewType.LIST_WIDGET,
    ViewType.CALENDAR_WIDGET,
  ])('should keep %s as its own layout', (viewType) => {
    expect(getRecordTableWidgetLayoutViewType(viewType)).toBe(viewType);
  });

  it.each([
    ViewType.TABLE,
    ViewType.KANBAN,
    ViewType.LIST,
    ViewType.CALENDAR,
    ViewType.FIELDS_WIDGET,
    undefined,
    null,
  ])('should fall back to the table layout for %s', (viewType) => {
    expect(getRecordTableWidgetLayoutViewType(viewType)).toBe(
      ViewType.TABLE_WIDGET,
    );
  });
});

describe('RECORD_TABLE_WIDGET_LAYOUT_OPTIONS', () => {
  it.each<[RecordTableWidgetLayoutViewType, IconComponent]>([
    [ViewType.TABLE_WIDGET, IconTable],
    [ViewType.KANBAN_WIDGET, IconLayoutKanban],
    [ViewType.LIST_WIDGET, IconList],
    [ViewType.CALENDAR_WIDGET, IconCalendar],
  ])('should give %s its own icon', (viewType, expectedIcon) => {
    expect(RECORD_TABLE_WIDGET_LAYOUT_OPTIONS[viewType].Icon).toBe(
      expectedIcon,
    );
  });
});
