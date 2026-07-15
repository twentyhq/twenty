import { getSupportedRecordCalendarLayout } from '@/object-record/record-calendar/utils/getSupportedRecordCalendarLayout';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

describe('getSupportedRecordCalendarLayout', () => {
  it.each([
    [ViewCalendarLayout.WEEK, ViewCalendarLayout.WEEK],
    [ViewCalendarLayout.MONTH, ViewCalendarLayout.MONTH],
    [ViewCalendarLayout.DAY, ViewCalendarLayout.DAY],
    [null, ViewCalendarLayout.MONTH],
    [undefined, ViewCalendarLayout.MONTH],
  ])(
    'normalizes %s to %s when the week view is enabled',
    (calendarLayout, expectedLayout) => {
      expect(
        getSupportedRecordCalendarLayout({
          calendarLayout,
          isCalendarWeekViewEnabled: true,
        }),
      ).toBe(expectedLayout);
    },
  );

  it.each([
    ViewCalendarLayout.WEEK,
    ViewCalendarLayout.MONTH,
    ViewCalendarLayout.DAY,
    null,
    undefined,
  ])(
    'normalizes %s to month when the week view is disabled',
    (calendarLayout) => {
      expect(
        getSupportedRecordCalendarLayout({
          calendarLayout,
          isCalendarWeekViewEnabled: false,
        }),
      ).toBe(ViewCalendarLayout.MONTH);
    },
  );
});
