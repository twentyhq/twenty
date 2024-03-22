import { renderHook } from '@testing-library/react';

import { useCalendarEventStates } from '@/activities/calendar/hooks/internal/useCalendarEventStates';

const mockScopeId = 'mockScopeId';
const mockGetCalendarEventsPageState = jest.fn();

jest.mock(
  '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId',
  () => ({
    useAvailableScopeIdOrThrow: () => mockScopeId,
  }),
);

jest.mock(
  '@/ui/utilities/state/component-state/utils/extractComponentState',
  () => ({
    extractComponentState: () => mockGetCalendarEventsPageState,
  }),
);

describe('useCalendarEventStates hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the correct scopeId and getCalendarEventsPageState', () => {
    const { result } = renderHook(() =>
      useCalendarEventStates({
        calendarEventScopeId: 'mockCalendarEventScopeId',
      }),
    );

    expect(result.current.scopeId).toBe(mockScopeId);
    expect(result.current.calendarEventsPageState).toBe(
      mockGetCalendarEventsPageState,
    );
  });
});
