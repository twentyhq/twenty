import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';

import { DatePickerException } from '@/ui/input/components/internal/date/exceptions/DatePickerException';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';

import { getDatePickerWeekStartOrThrow } from '@/ui/input/components/internal/date/utils/getDatePickerWeekStartOrThrow';

jest.mock('@/localization/utils/detection/detectCalendarStartDay');

describe('getDatePickerWeekStartOrThrow', () => {
  it.each([CalendarStartDay.MONDAY, CalendarStartDay.SATURDAY, 2])(
    'preserves the configured weekday %s',
    (calendarStartDay) => {
      expect(getDatePickerWeekStartOrThrow(calendarStartDay)).toBe(
        calendarStartDay,
      );
    },
  );

  it.each([undefined, null])(
    'uses Sunday for missing preference %s',
    (calendarStartDay) => {
      expect(getDatePickerWeekStartOrThrow(calendarStartDay)).toBe(
        CalendarStartDay.SUNDAY,
      );
    },
  );

  it.each([-1, 8])('rejects the unsupported weekday %s', (calendarStartDay) => {
    expect(() => getDatePickerWeekStartOrThrow(calendarStartDay)).toThrow(
      DatePickerException,
    );
  });

  it('detects the weekday for the system preference', () => {
    jest
      .mocked(detectCalendarStartDay)
      .mockReturnValue(FirstDayOfTheWeek.MONDAY);

    expect(getDatePickerWeekStartOrThrow(CalendarStartDay.SYSTEM)).toBe(
      CalendarStartDay.MONDAY,
    );
  });
});
