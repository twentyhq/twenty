import {
  getRecordTableWidgetLayout,
  getRecordTableWidgetLayoutViewType,
} from '@/page-layout/widgets/record-table/types/RecordTableWidgetLayoutViewType';
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

describe('getRecordTableWidgetLayout', () => {
  it.each([
    [ViewType.TABLE_WIDGET, ViewType.TABLE],
    [ViewType.KANBAN_WIDGET, ViewType.KANBAN],
    [ViewType.LIST_WIDGET, ViewType.LIST],
    [ViewType.CALENDAR_WIDGET, ViewType.CALENDAR],
  ])('should reduce %s to the %s layout', (viewType, expectedLayout) => {
    expect(getRecordTableWidgetLayout(viewType)).toBe(expectedLayout);
  });

  // A widget backed by a plain view keeps that view's layout.
  it.each([
    [ViewType.LIST, ViewType.LIST],
    [ViewType.KANBAN, ViewType.KANBAN],
  ])('should keep the %s layout of a non-widget view', (viewType, expected) => {
    expect(getRecordTableWidgetLayout(viewType)).toBe(expected);
  });

  it.each([ViewType.FIELDS_WIDGET, undefined, null])(
    'should fall back to the table layout for %s',
    (viewType) => {
      expect(getRecordTableWidgetLayout(viewType)).toBe(ViewType.TABLE);
    },
  );
});
