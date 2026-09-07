import { getWidgetViewLayoutSettingsItemIds } from '@/side-panel/pages/page-layout/utils/getWidgetViewLayoutSettingsItemIds';

describe('getWidgetViewLayoutSettingsItemIds', () => {
  it('returns the layout and group-by rows for a table layout', () => {
    expect(
      getWidgetViewLayoutSettingsItemIds({
        isCalendarLayout: false,
        hasGroupBy: false,
      }),
    ).toEqual(['object-view-layout', 'record-table-group-by']);
  });

  it('appends the hide-empty-groups row while grouped', () => {
    expect(
      getWidgetViewLayoutSettingsItemIds({
        isCalendarLayout: false,
        hasGroupBy: true,
      }),
    ).toEqual([
      'object-view-layout',
      'record-table-group-by',
      'record-table-hide-empty-groups',
    ]);
  });

  it('swaps group-by rows for calendar field and layout rows', () => {
    expect(
      getWidgetViewLayoutSettingsItemIds({
        isCalendarLayout: true,
        hasGroupBy: true,
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
        hasGroupBy: false,
        isLayoutRowHidden: true,
      }),
    ).toEqual(['record-table-group-by']);
  });
});
