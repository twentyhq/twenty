import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { Temporal } from 'temporal-polyfill';

import { DateFormat } from '@/localization/constants/DateFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { useParseZonedDateTimeToIMaskDateTimeInputString } from '@/ui/input/components/internal/date/hooks/useParseZonedDateTimeToIMaskDateTimeInputString';
import { CalendarStartDay } from 'twenty-shared/constants';

describe('useParseZonedDateTimeToIMaskDateTimeInputString', () => {
  const testZonedDateTime = Temporal.ZonedDateTime.from({
    year: 2024,
    month: 3,
    day: 15,
    hour: 14,
    minute: 30,
    timeZone: 'Pacific/Auckland',
  });

  const createWrapper =
    (dateFormat: DateFormat) =>
    ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot
        initializeState={(snapshot) => {
          snapshot.set(workspaceMemberFormatPreferencesState, {
            timeZone: 'Pacific/Auckland',
            dateFormat,
            timeFormat: TimeFormat.HOUR_24,
            numberFormat: NumberFormat.COMMAS_AND_DOT,
            calendarStartDay: CalendarStartDay.MONDAY,
          });
        }}
      >
        {children}
      </RecoilRoot>
    );

  it('should format with day first format (DD/MM/YYYY, HH:mm)', () => {
    const { result } = renderHook(
      () => useParseZonedDateTimeToIMaskDateTimeInputString(),
      { wrapper: createWrapper(DateFormat.DAY_FIRST) },
    );

    const formattedString =
      result.current.parseZonedDateTimeToDateTimeInputString(testZonedDateTime);

    expect(formattedString).toBe('15/03/2024, 14:30');
  });

  it('should format with year first format (YYYY-MM-DD, HH:mm)', () => {
    const { result } = renderHook(
      () => useParseZonedDateTimeToIMaskDateTimeInputString(),
      { wrapper: createWrapper(DateFormat.YEAR_FIRST) },
    );

    const formattedString =
      result.current.parseZonedDateTimeToDateTimeInputString(testZonedDateTime);

    expect(formattedString).toBe('2024-03-15, 14:30');
  });

  it('should format with month first format (MM/DD/YYYY, HH:mm)', () => {
    const { result } = renderHook(
      () => useParseZonedDateTimeToIMaskDateTimeInputString(),
      { wrapper: createWrapper(DateFormat.MONTH_FIRST) },
    );

    const formattedString =
      result.current.parseZonedDateTimeToDateTimeInputString(testZonedDateTime);

    expect(formattedString).toBe('03/15/2024, 14:30');
  });

  it('should format with month first format when dateFormat is SYSTEM', () => {
    const { result } = renderHook(
      () => useParseZonedDateTimeToIMaskDateTimeInputString(),
      { wrapper: createWrapper(DateFormat.SYSTEM) },
    );

    const formattedString =
      result.current.parseZonedDateTimeToDateTimeInputString(testZonedDateTime);

    expect(formattedString).toBe('03/15/2024, 14:30');
  });
});
