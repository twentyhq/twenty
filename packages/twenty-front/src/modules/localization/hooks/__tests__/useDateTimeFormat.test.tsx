import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { CalendarStartDay } from 'twenty-shared/constants';

const mockPreferences = {
  timeZone: 'America/New_York',
  dateFormat: DateFormat.MONTH_FIRST,
  timeFormat: TimeFormat.HOUR_24,
  numberFormat: '1,000.00' as any,
  calendarStartDay: CalendarStartDay.MONDAY,
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot
    initializeState={({ set }) => {
      set(workspaceMemberFormatPreferencesState, mockPreferences);
    }}
  >
    {children}
  </RecoilRoot>
);

describe('useDateTimeFormat', () => {
  it('should be a function', () => {
    expect(typeof useDateTimeFormat).toBe('function');
  });

  it('should return date and time format preferences', () => {
    const { result } = renderHook(() => useDateTimeFormat(), {
      wrapper: Wrapper,
    });

    expect(result.current).toEqual({
      timeZone: 'America/New_York',
      dateFormat: DateFormat.MONTH_FIRST,
      timeFormat: TimeFormat.HOUR_24,
      calendarStartDay: CalendarStartDay.MONDAY,
    });
  });

  it('should return updated values when preferences change', () => {
    const { result } = renderHook(() => useDateTimeFormat(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <RecoilRoot
          initializeState={({ set }) => {
            set(workspaceMemberFormatPreferencesState, {
              ...mockPreferences,
              timeZone: 'Europe/London',
              dateFormat: DateFormat.DAY_FIRST,
            });
          }}
        >
          {children}
        </RecoilRoot>
      ),
    });

    expect(result.current.timeZone).toBe('Europe/London');
    expect(result.current.dateFormat).toBe(DateFormat.DAY_FIRST);
    expect(result.current.timeFormat).toBe(TimeFormat.HOUR_24);
    expect(result.current.calendarStartDay).toBe(CalendarStartDay.MONDAY);
  });

  it('should have stable return object structure', () => {
    const { result } = renderHook(() => useDateTimeFormat(), {
      wrapper: Wrapper,
    });

    const keys = Object.keys(result.current);
    expect(keys).toEqual([
      'timeZone',
      'dateFormat',
      'timeFormat',
      'calendarStartDay',
    ]);
  });
});
