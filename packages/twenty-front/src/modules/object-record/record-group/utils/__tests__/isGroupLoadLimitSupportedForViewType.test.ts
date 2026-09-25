import { isGroupLoadLimitSupportedForViewType } from '@/object-record/record-group/utils/isGroupLoadLimitSupportedForViewType';
import { ViewType } from '@/views/types/ViewType';

describe('isGroupLoadLimitSupportedForViewType', () => {
  it.each([
    ViewType.TABLE,
    ViewType.LIST,
    ViewType.TABLE_WIDGET,
    ViewType.LIST_WIDGET,
  ])('pages a %s view group with the view load limit', (viewType) => {
    expect(isGroupLoadLimitSupportedForViewType(viewType)).toBe(true);
  });

  it.each([
    ViewType.KANBAN,
    ViewType.CALENDAR,
    ViewType.KANBAN_WIDGET,
    ViewType.CALENDAR_WIDGET,
    ViewType.FIELDS_WIDGET,
  ])('leaves a %s view on its own paging', (viewType) => {
    expect(isGroupLoadLimitSupportedForViewType(viewType)).toBe(false);
  });
});
