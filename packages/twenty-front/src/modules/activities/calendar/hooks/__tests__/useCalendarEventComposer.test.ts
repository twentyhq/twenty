import { act, renderHook } from '@testing-library/react';
import { Temporal } from 'temporal-polyfill';

import { useCalendarEventComposer } from '@/activities/calendar/hooks/useCalendarEventComposer';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import {
  CalendarEventRecurrenceFrequency,
  CalendarEventRecurrenceWeekday,
} from '~/generated-metadata/graphql';

const mockCreateCalendarEvent = jest.fn();
const mockCreateCalendarEventTargets = jest.fn();
const mockRefetchTimelineCalendarEvents = jest.fn();
const mockContextRecord: { current: ObjectRecord | undefined } = {
  current: undefined,
};
const mockTargetObjectMetadataItems: {
  current: { id: string; nameSingular: string }[];
} = { current: [] };

jest.mock('@/activities/calendar/hooks/useCreateCalendarEvent', () => ({
  useCreateCalendarEvent: () => ({
    createCalendarEvent: mockCreateCalendarEvent,
    loading: false,
  }),
}));

jest.mock(
  '@/activities/calendar/hooks/useRefetchTimelineCalendarEvents',
  () => ({
    useRefetchTimelineCalendarEvents: () => ({
      refetchTimelineCalendarEvents: mockRefetchTimelineCalendarEvents,
    }),
  }),
);

jest.mock('@/activities/calendar/hooks/useCreateCalendarEventTargets', () => ({
  useCreateCalendarEventTargets: () => ({
    createCalendarEventTargets: mockCreateCalendarEventTargets,
  }),
}));

jest.mock(
  '@/activities/calendar/hooks/useCalendarEventTargetObjectMetadataItems',
  () => ({
    useCalendarEventTargetObjectMetadataItems: () =>
      mockTargetObjectMetadataItems.current,
  }),
);

jest.mock('@/object-record/hooks/useFindOneRecord', () => ({
  useFindOneRecord: () => ({ record: mockContextRecord.current }),
}));

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
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
    mockTargetObjectMetadataItems.current = [
      { id: 'person-object-metadata-id', nameSingular: 'person' },
    ];
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

    expect(mockRefetchTimelineCalendarEvents).toHaveBeenCalled();
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

  it('creates the event without relations when the workspace has no junction', async () => {
    mockTargetObjectMetadataItems.current = [];
    mockContextRecord.current = { id: 'person-id' } as ObjectRecord;
    mockCreateCalendarEvent.mockResolvedValue({
      success: true,
      calendarEventId: 'calendar-event-id',
    });

    const onCreated = jest.fn();
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
        onCreated,
      }),
    );

    expect(result.current.canPickTargets).toBe(false);
    expect(result.current.targets).toEqual([]);

    act(() => {
      result.current.setTitle('Planning session');
    });

    await act(async () => {
      await result.current.handleCreate();
    });

    expect(mockCreateCalendarEventTargets).not.toHaveBeenCalled();
    expect(onCreated).toHaveBeenCalledTimes(1);
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

  describe('recurrence', () => {
    const renderComposer = () =>
      renderHook(() =>
        useCalendarEventComposer({
          initialValues: {
            connectedAccountId: 'account-id',
            contextRecord: {
              objectNameSingular: 'person',
              recordId: 'person-id',
            },
            defaultAttendees: '',
            timeZone: 'Europe/Paris',
          },
          onCreated: jest.fn(),
        }),
      );

    it('submits a weekly series ending after a number of occurrences', async () => {
      mockCreateCalendarEvent.mockResolvedValue({ success: true });

      const { result } = renderComposer();

      act(() => {
        result.current.setTitle('Weekly sync');
        result.current.handleRecurrenceFrequencyChange(
          CalendarEventRecurrenceFrequency.WEEKLY,
        );
      });

      act(() => {
        result.current.updateRecurrence({
          daysOfWeek: [CalendarEventRecurrenceWeekday.THURSDAY],
        });
        result.current.handleRecurrenceEndTypeChange('AFTER_OCCURRENCE_COUNT');
      });

      await act(async () => {
        await result.current.handleCreate();
      });

      expect(mockCreateCalendarEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          recurrence: {
            frequency: CalendarEventRecurrenceFrequency.WEEKLY,
            interval: 1,
            daysOfWeek: [CalendarEventRecurrenceWeekday.THURSDAY],
            endOccurrenceCount: 10,
          },
        }),
      );
    });

    it('prefills the end date ten occurrences out and blocks an end before the start', () => {
      const { result } = renderComposer();

      act(() => {
        result.current.setTitle('Monthly review');
        result.current.handleStartsAtChange('2026-10-20T07:00:00Z');
        result.current.handleRecurrenceFrequencyChange(
          CalendarEventRecurrenceFrequency.MONTHLY,
        );
      });

      act(() => {
        result.current.handleRecurrenceEndTypeChange('ON_DATE');
      });

      expect(result.current.recurrence?.end).toEqual({
        type: 'ON_DATE',
        endDate: '2027-07-20',
      });

      act(() => {
        result.current.updateRecurrence({
          end: { type: 'ON_DATE', endDate: '2026-10-19' },
        });
      });

      expect(result.current.canCreate).toBe(false);
    });
  });
});
