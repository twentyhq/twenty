import { act, renderHook } from '@testing-library/react';

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
});
