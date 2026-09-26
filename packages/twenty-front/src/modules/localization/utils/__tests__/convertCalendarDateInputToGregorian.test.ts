import { CalendarSystem } from '@/localization/constants/CalendarSystem';
import { convertCalendarDateInputToGregorian } from '@/localization/utils/convertCalendarDateInputToGregorian';

describe('convertCalendarDateInputToGregorian', () => {
  it('should leave Gregorian input untouched', () => {
    expect(
      convertCalendarDateInputToGregorian({
        dateInput: '26/09/2026',
        dateInputFormat: 'dd/MM/yyyy',
        calendarSystem: CalendarSystem.GREGORIAN,
      }),
    ).toBe('26/09/2026');
  });

  it('should convert a Persian date for each field order', () => {
    expect(
      convertCalendarDateInputToGregorian({
        dateInput: '04/07/1405',
        dateInputFormat: 'dd/MM/yyyy',
        calendarSystem: CalendarSystem.PERSIAN,
      }),
    ).toBe('26/09/2026');
    expect(
      convertCalendarDateInputToGregorian({
        dateInput: '1405-07-04',
        dateInputFormat: 'yyyy-MM-dd',
        calendarSystem: CalendarSystem.PERSIAN,
      }),
    ).toBe('2026-09-26');
  });

  it('should keep the time part of a date time input', () => {
    expect(
      convertCalendarDateInputToGregorian({
        dateInput: '04/15/1448 09:30 PM',
        dateInputFormat: 'MM/dd/yyyy hh:mm a',
        calendarSystem: CalendarSystem.ISLAMIC,
      }),
    ).toBe('09/26/2026 09:30 PM');
  });

  it('should return null for a day that does not exist in the calendar', () => {
    expect(
      convertCalendarDateInputToGregorian({
        dateInput: '31/07/1405',
        dateInputFormat: 'dd/MM/yyyy',
        calendarSystem: CalendarSystem.PERSIAN,
      }),
    ).toBeNull();
  });

  it('should return null for an incomplete input', () => {
    expect(
      convertCalendarDateInputToGregorian({
        dateInput: '04/__/____',
        dateInputFormat: 'dd/MM/yyyy',
        calendarSystem: CalendarSystem.PERSIAN,
      }),
    ).toBeNull();
  });
});
