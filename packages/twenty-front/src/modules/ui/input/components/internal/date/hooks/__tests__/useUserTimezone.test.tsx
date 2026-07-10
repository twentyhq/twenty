import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { normalizeTimeZone } from '@/localization/utils/normalizeTimeZone';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/localization/utils/normalizeTimeZone', () => ({
  normalizeTimeZone: jest.fn((timeZone: string) => timeZone),
}));

const mockNormalizeTimeZone = jest.mocked(normalizeTimeZone);

describe('useUserTimezone', () => {
  const originalIntl = global.Intl;
  const mockSystemTimezone = 'America/New_York';

  beforeAll(() => {
    // Mock Intl.DateTimeFormat to return a consistent system timezone
    global.Intl = {
      ...originalIntl,
      DateTimeFormat: jest.fn().mockImplementation(() => ({
        resolvedOptions: () => ({ timeZone: mockSystemTimezone }),
      })),
    } as any;
  });

  beforeEach(() => {
    mockNormalizeTimeZone.mockImplementation((timeZone: string) => timeZone);
  });

  afterAll(() => {
    global.Intl = originalIntl;
  });

  it('should return system timezone when currentWorkspaceMember is null', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
    );

    const { result } = renderHook(() => useUserTimezone(), {
      wrapper: Wrapper,
    });

    expect(result.current.userTimezone).toBe(mockSystemTimezone);
    expect(result.current.isSystemTimezone).toBe(true);
  });

  it('should return system timezone when currentWorkspaceMember.timeZone is "system"', () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'workspace-member-id',
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
      colorScheme: 'Light',
      locale: 'en-US',
      userEmail: 'john@example.com',
      timeZone: 'system',
      dateFormat: null,
      timeFormat: null,
      numberFormat: null,
      calendarStartDay: null,
    });

    const WrapperWithSystemTimezone = ({
      children,
    }: {
      children: React.ReactNode;
    }) => <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>;

    const { result } = renderHook(() => useUserTimezone(), {
      wrapper: WrapperWithSystemTimezone,
    });

    expect(result.current.userTimezone).toBe(mockSystemTimezone);
    expect(result.current.isSystemTimezone).toBe(true);
  });

  it('should return user-specific timezone when currentWorkspaceMember.timeZone is set', () => {
    const userTimezone = 'Europe/Paris';

    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'workspace-member-id',
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
      colorScheme: 'Light',
      locale: 'en-US',
      userEmail: 'john@example.com',
      timeZone: userTimezone,
      dateFormat: null,
      timeFormat: null,
      numberFormat: null,
      calendarStartDay: null,
    });

    const WrapperWithUserTimezone = ({
      children,
    }: {
      children: React.ReactNode;
    }) => <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>;

    const { result } = renderHook(() => useUserTimezone(), {
      wrapper: WrapperWithUserTimezone,
    });

    expect(result.current.userTimezone).toBe(userTimezone);
    expect(result.current.isSystemTimezone).toBe(false);
  });

  it('should normalize a legacy alias stored on the workspace member', () => {
    mockNormalizeTimeZone.mockImplementation((timeZone: string) =>
      timeZone === 'CET' ? 'Europe/Paris' : timeZone,
    );

    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'workspace-member-id',
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
      colorScheme: 'Light',
      locale: 'en-US',
      userEmail: 'john@example.com',
      timeZone: 'CET',
      dateFormat: null,
      timeFormat: null,
      numberFormat: null,
      calendarStartDay: null,
    });

    const WrapperWithLegacyTimezone = ({
      children,
    }: {
      children: React.ReactNode;
    }) => <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>;

    const { result } = renderHook(() => useUserTimezone(), {
      wrapper: WrapperWithLegacyTimezone,
    });

    expect(mockNormalizeTimeZone).toHaveBeenCalledWith('CET');
    expect(result.current.userTimezone).toBe('Europe/Paris');
  });
});
