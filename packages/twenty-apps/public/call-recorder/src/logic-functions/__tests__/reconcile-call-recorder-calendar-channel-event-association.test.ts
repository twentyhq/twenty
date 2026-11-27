import { beforeEach, describe, expect, it, vi } from 'vitest';

import reconcileLogicFunction, {
  reconcileCallRecorderCalendarChannelEventAssociationHandler,
} from 'src/logic-functions/reconcile-call-recorder-calendar-channel-event-association';

const reconcileMock = vi.hoisted(() => vi.fn());
const fetchUpcomingCalendarEventsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({ CoreApiClient: class {} }));

vi.mock('src/logic-functions/flows/reconcile-call-recorder.util', () => ({
  reconcileCallRecorderForCalendarEventIds: reconcileMock,
}));

vi.mock('src/logic-functions/data/fetch-upcoming-calendar-events.util', () => ({
  fetchUpcomingCalendarEvents: fetchUpcomingCalendarEventsMock,
}));

const buildLinkedBatch = (calendarEventIds: string[]) => ({
  events: calendarEventIds.map((calendarEventId, index) => ({
    eventId: `database-event-${index}`,
    recordId: `association-${index}`,
    properties: { after: { id: `association-${index}`, calendarEventId } },
  })),
});

const setUpcomingCalendarEventIds = (upcomingCalendarEventIds: string[]) =>
  fetchUpcomingCalendarEventsMock.mockImplementation(
    async ({
      candidateCalendarEventIds,
    }: {
      candidateCalendarEventIds: string[];
    }) =>
      upcomingCalendarEventIds
        .filter((id) => candidateCalendarEventIds.includes(id))
        .map((id) => ({ id, startsAt: undefined })),
  );

describe('reconcileCallRecorderCalendarChannelEventAssociationHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reconcileMock.mockResolvedValue([]);
    setUpcomingCalendarEventIds(['calendar-event-1', 'calendar-event-2']);
  });

  it('reconciles each meeting a calendar was linked to once', async () => {
    const result =
      await reconcileCallRecorderCalendarChannelEventAssociationHandler(
        buildLinkedBatch([
          'calendar-event-2',
          'calendar-event-1',
          'calendar-event-2',
        ]),
      );

    expect(reconcileMock).toHaveBeenCalledTimes(1);
    expect(reconcileMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
      }),
    );
    expect(result).toMatchObject({ reconciled: true });
  });

  it('reconciles the meeting a calendar was unlinked from', async () => {
    await reconcileCallRecorderCalendarChannelEventAssociationHandler({
      events: [
        {
          eventId: 'database-event-1',
          recordId: 'association-1',
          properties: {
            before: {
              id: 'association-1',
              calendarEventId: 'calendar-event-1',
            },
          },
        },
      ],
    });

    expect(reconcileMock).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-1'] }),
    );
  });

  it('leaves out meetings that are not upcoming', async () => {
    setUpcomingCalendarEventIds(['calendar-event-2']);

    await reconcileCallRecorderCalendarChannelEventAssociationHandler(
      buildLinkedBatch(['calendar-event-1', 'calendar-event-2']),
    );

    expect(reconcileMock).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-2'] }),
    );
  });

  it('does nothing when none of the meetings is upcoming', async () => {
    setUpcomingCalendarEventIds([]);

    const result =
      await reconcileCallRecorderCalendarChannelEventAssociationHandler(
        buildLinkedBatch(['calendar-event-1']),
      );

    expect(reconcileMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({ skipped: true });
  });

  it('does nothing when the batch names no calendar event', async () => {
    const result =
      await reconcileCallRecorderCalendarChannelEventAssociationHandler(
        buildLinkedBatch([]),
      );

    expect(fetchUpcomingCalendarEventsMock).not.toHaveBeenCalled();
    expect(reconcileMock).not.toHaveBeenCalled();
    expect(result).toMatchObject({ skipped: true });
  });

  it('listens to a calendar being linked to, unlinked from or moved between meetings', () => {
    expect(
      reconcileLogicFunction.config.databaseEventTriggerSettings,
    ).toMatchObject({
      eventName: 'calendarChannelEventAssociation.*',
      updatedFields: ['calendarChannelId', 'calendarEventId'],
      batchMode: true,
    });
  });
});
