import { act, renderHook } from '@testing-library/react';
import { Temporal } from 'temporal-polyfill';

import { useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

const mockCreateCalendarEvent = jest.fn();
const mockCreateCalendarEventTargets = jest.fn();
const mockContextRecord: { current: ObjectRecord | undefined } = {
  current: undefined,
};

jest.mock('@/activities/calendar/hooks/useCreateCalendarEvent', () => ({
  useCreateCalendarEvent: () => ({
    createCalendarEvent: mockCreateCalendarEvent,
    loading: false,
  }),
}));

jest.mock('@/activities/calendar/hooks/useCreateCalendarEventTargets', () => ({
  useCreateCalendarEventTargets: () => ({
    createCalendarEventTargets: mockCreateCalendarEventTargets,
  }),
}));

jest.mock(
  '@/activities/calendar/hooks/useCalendarEventTargetObjectMetadataItems',
  () => ({
    useCalendarEventTargetObjectMetadataItems: () => [
      { id: 'person-object-metadata-id', nameSingular: 'person' },
    ],
  }),
);

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: () => ({ record: mockContextRecord.current }),
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: jest.fn() }),
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

describe('useCalendarEventComposer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockContextRecord.current = undefined;
  });

  it('submits only once while creation is pending', async () => {
    let resolveCreation: ((result: { success: boolean }) => void) | undefined;

    mockCreateCalendarEvent.mockReturnValue(
      new Promise<{ success: boolean }>((resolve) => {
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

    resolveCreation?.({ success: true });

    await act(async () => {
      await Promise.all([firstCreation, secondCreation]);
    });

    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it('keeps the location controlled and submits the selected value', async () => {
    mockCreateCalendarEvent.mockResolvedValue({ success: true });

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

  it('links the context record to the created event', async () => {
    mockContextRecord.current = { id: 'person-id' } as ObjectRecord;
    mockCreateCalendarEvent.mockResolvedValue({
      success: true,
      calendarEventId: 'calendar-event-id',
    });

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

    expect(result.current.targets).toEqual([
      {
        objectMetadataId: 'person-object-metadata-id',
        recordId: 'person-id',
        record: { id: 'person-id' },
      },
    ]);

    act(() => {
      result.current.setTitle('Planning session');
    });

    await act(async () => {
      await result.current.handleCreate();
    });

    expect(mockCreateCalendarEventTargets).toHaveBeenCalledWith({
      calendarEventId: 'calendar-event-id',
      targets: [
        {
          objectMetadataId: 'person-object-metadata-id',
          recordId: 'person-id',
          record: { id: 'person-id' },
        },
      ],
    });
  });

  it('drops a relation the user removed from the picker', () => {
    mockContextRecord.current = { id: 'person-id' } as ObjectRecord;

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
      result.current.handleTargetChange({
        recordId: 'person-id',
        objectMetadataId: 'person-object-metadata-id',
        isSelected: false,
        isMatchingSearchFilter: true,
      });
    });

    expect(result.current.targets).toEqual([]);
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
