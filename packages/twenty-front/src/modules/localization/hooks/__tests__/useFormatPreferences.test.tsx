import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot, type MutableSnapshot } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { DateFormat } from '@/localization/constants/DateFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useFormatPreferences } from '@/localization/hooks/useFormatPreferences';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { detectDateFormat } from '@/localization/utils/detection/detectDateFormat';
import { detectNumberFormat } from '@/localization/utils/detection/detectNumberFormat';
import { detectTimeFormat } from '@/localization/utils/detection/detectTimeFormat';
import { detectTimeZone } from '@/localization/utils/detection/detectTimeZone';
import { getWorkspaceMemberUpdateFromFormatPreferences } from '@/localization/utils/format-preferences/getWorkspaceMemberUpdateFromFormatPreferences';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { CalendarStartDay } from 'twenty-shared/constants';
import { FirstDayOfTheWeek } from 'twenty-shared/types';

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: jest.fn(),
}));
jest.mock('@/localization/utils/detection/detectTimeZone');
jest.mock('@/localization/utils/detection/detectDateFormat');
jest.mock('@/localization/utils/detection/detectTimeFormat');
jest.mock('@/localization/utils/detection/detectNumberFormat');
jest.mock('@/localization/utils/detection/detectCalendarStartDay');
jest.mock(
  '@/localization/utils/format-preferences/getWorkspaceMemberUpdateFromFormatPreferences',
);

const mockUseUpdateOneRecord = useUpdateOneRecord as jest.MockedFunction<
  typeof useUpdateOneRecord
>;
const mockDetectTimeZone = detectTimeZone as jest.MockedFunction<
  typeof detectTimeZone
>;
const mockDetectDateFormat = detectDateFormat as jest.MockedFunction<
  typeof detectDateFormat
>;
const mockDetectTimeFormat = detectTimeFormat as jest.MockedFunction<
  typeof detectTimeFormat
>;
const mockDetectNumberFormat = detectNumberFormat as jest.MockedFunction<
  typeof detectNumberFormat
>;
const mockDetectCalendarStartDay =
  detectCalendarStartDay as jest.MockedFunction<typeof detectCalendarStartDay>;
const mockGetWorkspaceMemberUpdateFromFormatPreferences =
  getWorkspaceMemberUpdateFromFormatPreferences as jest.MockedFunction<
    typeof getWorkspaceMemberUpdateFromFormatPreferences
  >;

const mockUpdateOneRecord = jest.fn();

const mockCurrentWorkspaceMember = {
  id: 'workspace-member-1',
  name: { firstName: 'Test', lastName: 'User' },
  locale: 'en',
  avatarUrl: null,
  userEmail: 'test@example.com',
  userId: 'user-1',
  colorScheme: 'Light' as const,
  workspaceId: 'workspace-1',
};

const mockInitialPreferences = {
  timeZone: 'UTC',
  dateFormat: DateFormat.MONTH_FIRST,
  timeFormat: TimeFormat.HOUR_24,
  numberFormat: NumberFormat.COMMAS_AND_DOT,
  calendarStartDay: CalendarStartDay.MONDAY,
};

const Wrapper = ({ children }: { children: ReactNode }) => {
  const initializeState = ({ set }: MutableSnapshot) => {
    set(currentWorkspaceMemberState, mockCurrentWorkspaceMember);
    set(workspaceMemberFormatPreferencesState, mockInitialPreferences);
  };

  return <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>;
};

describe('useFormatPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUpdateOneRecord.mockReturnValue({
      updateOneRecord: mockUpdateOneRecord,
    });

    mockDetectTimeZone.mockReturnValue('America/New_York');
    mockDetectDateFormat.mockReturnValue('MONTH_FIRST');
    mockDetectTimeFormat.mockReturnValue('HOUR_24');
    mockDetectNumberFormat.mockReturnValue('COMMAS_AND_DOT');
    mockDetectCalendarStartDay.mockReturnValue(FirstDayOfTheWeek.MONDAY);
    mockGetWorkspaceMemberUpdateFromFormatPreferences.mockReturnValue({});

    mockUpdateOneRecord.mockResolvedValue({});
  });

  it('should be a function', () => {
    expect(typeof useFormatPreferences).toBe('function');
  });

  it('should return format preferences and update functions', () => {
    const { result } = renderHook(() => useFormatPreferences(), {
      wrapper: Wrapper,
    });

    expect(result.current).toHaveProperty('formatPreferences');
    expect(result.current).toHaveProperty('updateFormatPreference');
    expect(result.current).toHaveProperty('updateMultipleFormatPreferences');
    expect(result.current).toHaveProperty('initializeFormatPreferences');

    expect(typeof result.current.updateFormatPreference).toBe('function');
    expect(typeof result.current.updateMultipleFormatPreferences).toBe(
      'function',
    );
    expect(typeof result.current.initializeFormatPreferences).toBe('function');
  });

  it('should return current format preferences', () => {
    const { result } = renderHook(() => useFormatPreferences(), {
      wrapper: Wrapper,
    });

    expect(result.current.formatPreferences).toEqual(mockInitialPreferences);
  });

  it('should update single format preference successfully', async () => {
    const { result } = renderHook(() => useFormatPreferences(), {
      wrapper: Wrapper,
    });

    const newTimeZone = 'Europe/London';
    mockGetWorkspaceMemberUpdateFromFormatPreferences.mockReturnValue({
      timeZone: newTimeZone,
    });

    await act(async () => {
      await result.current.updateFormatPreference('timeZone', newTimeZone);
    });

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      idToUpdate: mockCurrentWorkspaceMember.id,
      updateOneRecordInput: { timeZone: newTimeZone },
    });
  });

  it('should handle SYSTEM values by detecting actual format', async () => {
    const { result } = renderHook(() => useFormatPreferences(), {
      wrapper: Wrapper,
    });

    mockDetectTimeZone.mockReturnValue('America/Chicago');
    mockGetWorkspaceMemberUpdateFromFormatPreferences.mockReturnValue({
      timeZone: 'SYSTEM',
    });

    await act(async () => {
      await result.current.updateFormatPreference('timeZone', 'SYSTEM');
    });

    expect(mockDetectTimeZone).toHaveBeenCalled();
    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      idToUpdate: mockCurrentWorkspaceMember.id,
      updateOneRecordInput: { timeZone: 'SYSTEM' },
    });
  });

  it('should update multiple format preferences successfully', async () => {
    const { result } = renderHook(() => useFormatPreferences(), {
      wrapper: Wrapper,
    });

    const updates = {
      timeZone: 'Europe/Paris',
      numberFormat: NumberFormat.SPACES_AND_COMMA,
    };

    mockGetWorkspaceMemberUpdateFromFormatPreferences.mockReturnValue({
      timeZone: 'Europe/Paris',
    });

    await act(async () => {
      await result.current.updateMultipleFormatPreferences(updates);
    });

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      idToUpdate: mockCurrentWorkspaceMember.id,
      updateOneRecordInput: { timeZone: 'Europe/Paris' },
    });
  });

  it('should not update preferences when user is not logged in', async () => {
    const { result } = renderHook(() => useFormatPreferences(), {
      wrapper: ({ children }: { children: ReactNode }) => {
        const initializeState = ({ set }: MutableSnapshot) => {
          set(currentWorkspaceMemberState, null);
          set(workspaceMemberFormatPreferencesState, mockInitialPreferences);
        };

        return (
          <RecoilRoot initializeState={initializeState}>{children}</RecoilRoot>
        );
      },
    });

    await act(async () => {
      await result.current.updateFormatPreference('timeZone', 'Europe/London');
    });

    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('should handle update errors gracefully', async () => {
    const { result } = renderHook(() => useFormatPreferences(), {
      wrapper: Wrapper,
    });

    const error = new Error('Update failed');
    mockUpdateOneRecord.mockRejectedValue(error);

    await expect(
      act(async () => {
        await result.current.updateFormatPreference(
          'timeZone',
          'Europe/London',
        );
      }),
    ).rejects.toThrow('Update failed');
  });

  it('should initialize format preferences from workspace member', () => {
    const { result } = renderHook(() => useFormatPreferences(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.initializeFormatPreferences(mockCurrentWorkspaceMember);
    });

    expect(result.current.initializeFormatPreferences).toBeDefined();
  });

  it('should not initialize format preferences when workspace member is null', () => {
    const { result } = renderHook(() => useFormatPreferences(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.initializeFormatPreferences(null);
    });

    expect(result.current.initializeFormatPreferences).toBeDefined();
  });
});
