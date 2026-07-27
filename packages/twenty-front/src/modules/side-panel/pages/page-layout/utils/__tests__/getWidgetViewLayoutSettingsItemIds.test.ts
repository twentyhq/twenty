import { getWidgetViewLayoutSettingsItemIds } from '@/side-panel/pages/page-layout/utils/getWidgetViewLayoutSettingsItemIds';

describe('getWidgetViewLayoutSettingsItemIds', () => {
  it('returns the layout and group-by rows for a table layout', () => {
    expect(
      getWidgetViewLayoutSettingsItemIds({
        isCalendarLayout: false,
        isCalendarWeekViewEnabled: false,
        hasGroupBy: false,
      }),
    ).toEqual(['object-view-layout', 'record-table-group-by']);
  });

  it('appends the hide-empty-groups row while grouped', () => {
    expect(
      getWidgetViewLayoutSettingsItemIds({
        isCalendarLayout: false,
        isCalendarWeekViewEnabled: false,
        hasGroupBy: true,
      }),
    ).toEqual([
      'object-view-layout',
      'record-table-group-by',
      'record-table-hide-empty-groups',
    ]);
  });

  it('swaps group-by rows for the calendar field row on a calendar layout', () => {
    expect(
      getWidgetViewLayoutSettingsItemIds({
        isCalendarLayout: true,
        isCalendarWeekViewEnabled: false,
        hasGroupBy: true,
      }),
    ).toEqual(['object-view-layout', 'record-table-calendar-field']);
  });

  it('includes the calendar view row when the week/day flag is enabled', () => {
    expect(
      getWidgetViewLayoutSettingsItemIds({
        isCalendarLayout: true,
        isCalendarWeekViewEnabled: true,
        hasGroupBy: false,
      }),
    ).toEqual([
      'object-view-layout',
      'record-table-calendar-field',
      'record-table-calendar-layout',
    ]);
  });

  it('omits the layout row when it is hidden', () => {
    expect(
      getWidgetViewLayoutSettingsItemIds({
        isCalendarLayout: false,
        isCalendarWeekViewEnabled: false,
        hasGroupBy: false,
        isLayoutRowHidden: true,
      }),
    ).toEqual(['record-table-group-by']);
  });
});
