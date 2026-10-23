import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';

import { getDatePickerWeekStart } from '@/ui/input/components/internal/date/utils/getDatePickerWeekStart';

jest.mock('@/localization/utils/detection/detectCalendarStartDay');

describe('getDatePickerWeekStart', () => {
  it.each([CalendarStartDay.MONDAY, CalendarStartDay.SATURDAY, 2])(
    'preserves the configured weekday %s',
    (calendarStartDay) => {
      expect(getDatePickerWeekStart(calendarStartDay)).toBe(calendarStartDay);
    },
  );

  it.each([undefined, null, -1, 8])(
    'uses Sunday for missing or unsupported preference %s',
    (calendarStartDay) => {
      expect(getDatePickerWeekStart(calendarStartDay)).toBe(
        CalendarStartDay.SUNDAY,
      );
    },
  );

  it('detects the weekday for the system preference', () => {
    jest
      .mocked(detectCalendarStartDay)
      .mockReturnValue(FirstDayOfTheWeek.MONDAY);

    expect(getDatePickerWeekStart(CalendarStartDay.SYSTEM)).toBe(
      CalendarStartDay.MONDAY,
    );
  });
});
