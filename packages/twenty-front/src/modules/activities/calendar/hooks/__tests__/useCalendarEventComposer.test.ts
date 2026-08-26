import { act, renderHook } from '@testing-library/react';
import { Temporal } from 'temporal-polyfill';

import { useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';

const mockCreateCalendarEvent = jest.fn();

jest.mock('@/activities/calendar/hooks/useCreateCalendarEvent', () => ({
  useCreateCalendarEvent: () => ({
    createCalendarEvent: mockCreateCalendarEvent,
    loading: false,
  }),
}));

jest.mock('@/settings/accounts/hooks/useMyConnectedAccounts', () => ({
  useMyConnectedAccounts: () => ({
    accounts: [
      {
        id: 'account-id',
        handle: 'tim@apple.dev',
      },
    ],
    loading: false,
  }),
}));

jest.mock(
  '@/activities/calendar/utils/isCalendarCreationEnabledForAccount',
  () => ({
    isCalendarCreationEnabledForAccount: () => true,
  }),
);

jest.mock('@/accounts/utils/hasMissingCreateCalendarEventScopes', () => ({
  getMissingCreateCalendarEventScopes: () => [],
}));

jest.mock(
  '@/activities/calendar/hooks/useCalendarEventTargetRelatedPersonIds',
  () => ({
    useCalendarEventTargetRelatedPersonIds: () => ['person-id'],
  }),
);

describe('useCalendarEventComposer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits only once while creation is pending', async () => {
    let resolveCreation: ((success: boolean) => void) | undefined;

    mockCreateCalendarEvent.mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveCreation = resolve;
      }),
    );

    const onCreated = jest.fn();
    const { result } = renderHook(() =>
      useCalendarEventComposer({
        initialValues: {
          connectedAccountId: 'account-id',
          contextRecord: {
            objectNameSingular: 'person',
            recordId: 'person-id',
          },
          defaultAttendees: 'person@example.com',
          timeZone: 'UTC',
        },
        onCreated,
      }),
    );

    act(() => {
      result.current.setTitle('Planning session');
    });

    let firstCreation: Promise<void> | undefined;
    let secondCreation: Promise<void> | undefined;

    act(() => {
      firstCreation = result.current.handleCreate();
      secondCreation = result.current.handleCreate();
    });

    expect(mockCreateCalendarEvent).toHaveBeenCalledTimes(1);

    resolveCreation?.(true);

    await act(async () => {
      await Promise.all([firstCreation, secondCreation]);
    });

    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it('keeps the location controlled and submits the selected value', async () => {
    mockCreateCalendarEvent.mockResolvedValue(true);

    const { result } = renderHook(() =>
      useCalendarEventComposer({
        initialValues: {
          connectedAccountId: 'account-id',
          contextRecord: {
            objectNameSingular: 'person',
            recordId: 'person-id',
          },
          defaultAttendees: 'person@example.com',
          timeZone: 'UTC',
        },
        onCreated: jest.fn(),
      }),
    );

    act(() => {
      result.current.setTitle('Planning session');
      result.current.setLocation('48 Rue de Courcelles, Paris, France');
    });

    expect(result.current.location).toBe('48 Rue de Courcelles, Paris, France');

    await act(async () => {
      await result.current.handleCreate();
    });

    expect(mockCreateCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        location: '48 Rue de Courcelles, Paris, France',
      }),
    );
  });

  it('keeps an all-day event at least one day long', () => {
    const { result } = renderHook(() =>
      useCalendarEventComposer({
        initialValues: {
          connectedAccountId: 'account-id',
          contextRecord: {
            objectNameSingular: 'person',
            recordId: 'person-id',
          },
          defaultAttendees: '',
          timeZone: 'UTC',
        },
        onCreated: jest.fn(),
      }),
    );

    act(() => {
      result.current.handleIsFullDayChange(true);
    });

    const startsAt = result.current.dates.startsAt;

    act(() => {
      result.current.setEndsAt(startsAt);
    });

    expect(result.current.dates.endsAt).toBe(
      Temporal.PlainDate.from(startsAt).add({ days: 1 }).toString(),
    );
    expect(result.current.hasValidDateRange).toBe(true);
  });
});
