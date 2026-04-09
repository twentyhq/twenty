import { act, renderHook } from '@testing-library/react';

import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { useInitializeFormatPreferences } from '@/localization/hooks/useInitializeFormatPreferences';
import { getFormatPreferencesFromWorkspaceMember } from '@/localization/utils/format-preferences/getFormatPreferencesFromWorkspaceMember';

jest.mock(
  '@/localization/utils/format-preferences/getFormatPreferencesFromWorkspaceMember',
);

const mockGetFormatPreferencesFromWorkspaceMember =
  getFormatPreferencesFromWorkspaceMember as jest.MockedFunction<
    typeof getFormatPreferencesFromWorkspaceMember
  >;

describe('useInitializeFormatPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof useInitializeFormatPreferences).toBe('function');
  });

  it('should return initializeFormatPreferences function', () => {
    const { result } = renderHook(() => useInitializeFormatPreferences());

    expect(result.current).toHaveProperty('initializeFormatPreferences');
    expect(typeof result.current.initializeFormatPreferences).toBe('function');
  });

  it('should initialize format preferences when workspace member is provided', () => {
    const mockWorkspaceMember: CurrentWorkspaceMember = {
      id: '1',
      name: { firstName: 'Test', lastName: 'User' },
      locale: 'en',
      avatarUrl: null,
      userEmail: 'test@example.com',
      colorScheme: 'Light',
    };

    const mockPreferences = {
      timeZone: 'UTC',
      dateFormat: 'MM/dd/yyyy' as any,
      timeFormat: 'HH:mm' as any,
      numberFormat: '1,000.00' as any,
      calendarStartDay: 'MONDAY' as any,
    };

    mockGetFormatPreferencesFromWorkspaceMember.mockReturnValue(
      mockPreferences,
    );

    const { result } = renderHook(() => useInitializeFormatPreferences());

    act(() => {
      result.current.initializeFormatPreferences(mockWorkspaceMember);
    });

    expect(mockGetFormatPreferencesFromWorkspaceMember).toHaveBeenCalledWith(
      mockWorkspaceMember,
    );
  });

  it('should not initialize format preferences when workspace member is null', () => {
    const { result } = renderHook(() => useInitializeFormatPreferences());

    act(() => {
      result.current.initializeFormatPreferences(null);
    });

    expect(mockGetFormatPreferencesFromWorkspaceMember).not.toHaveBeenCalled();
  });

  it('should not initialize format preferences when workspace member is undefined', () => {
    const { result } = renderHook(() => useInitializeFormatPreferences());

    act(() => {
      result.current.initializeFormatPreferences(undefined as any);
    });

    expect(mockGetFormatPreferencesFromWorkspaceMember).not.toHaveBeenCalled();
  });
});
