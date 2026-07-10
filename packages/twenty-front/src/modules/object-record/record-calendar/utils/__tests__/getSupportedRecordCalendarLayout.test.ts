import { getSupportedRecordCalendarLayout } from '@/object-record/record-calendar/utils/getSupportedRecordCalendarLayout';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

describe('getSupportedRecordCalendarLayout', () => {
  it.each([
    [ViewCalendarLayout.WEEK, ViewCalendarLayout.WEEK],
    [ViewCalendarLayout.MONTH, ViewCalendarLayout.MONTH],
    [ViewCalendarLayout.DAY, ViewCalendarLayout.MONTH],
    [null, ViewCalendarLayout.MONTH],
    [undefined, ViewCalendarLayout.MONTH],
  ])('normalizes %s to %s', (calendarLayout, expectedLayout) => {
    expect(getSupportedRecordCalendarLayout(calendarLayout)).toBe(
      expectedLayout,
    );
  });
});
