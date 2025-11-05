import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';

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

  afterAll(() => {
    global.Intl = originalIntl;
  });

  it('should return system timezone when currentWorkspaceMember is null', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <RecoilRoot>{children}</RecoilRoot>
    );

    const { result } = renderHook(() => useUserTimezone(), {
      wrapper: Wrapper,
    });

    expect(result.current.userTimezone).toBe(mockSystemTimezone);
    expect(result.current.isSystemTimezone).toBe(true);
  });

  it('should return system timezone when currentWorkspaceMember.timeZone is "system"', () => {
    const WrapperWithSystemTimezone = ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <RecoilRoot
        initializeState={(snapshot) => {
          snapshot.set(currentWorkspaceMemberState, {
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
        }}
      >
        {children}
      </RecoilRoot>
    );

    const { result } = renderHook(() => useUserTimezone(), {
      wrapper: WrapperWithSystemTimezone,
    });

    expect(result.current.userTimezone).toBe(mockSystemTimezone);
    expect(result.current.isSystemTimezone).toBe(true);
  });

  it('should return user-specific timezone when currentWorkspaceMember.timeZone is set', () => {
    const userTimezone = 'Europe/Paris';

    const WrapperWithUserTimezone = ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <RecoilRoot
        initializeState={(snapshot) => {
          snapshot.set(currentWorkspaceMemberState, {
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
        }}
      >
        {children}
      </RecoilRoot>
    );

    const { result } = renderHook(() => useUserTimezone(), {
      wrapper: WrapperWithUserTimezone,
    });

    expect(result.current.userTimezone).toBe(userTimezone);
    expect(result.current.isSystemTimezone).toBe(false);
  });
});
