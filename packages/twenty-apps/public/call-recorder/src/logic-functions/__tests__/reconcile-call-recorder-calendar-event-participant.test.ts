import { beforeEach, describe, expect, it, vi } from 'vitest';

import reconcileParticipantLogicFunction, {
  reconcileCallRecorderCalendarEventParticipantHandler,
} from 'src/logic-functions/reconcile-call-recorder-calendar-event-participant';

const reconcileMock = vi.hoisted(() => vi.fn());
const fetchOptedInWorkspaceMemberIdsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('src/logic-functions/flows/reconcile-call-recorder.util', () => ({
  reconcileCallRecorderForCalendarEventIds: reconcileMock,
}));

vi.mock(
  'src/logic-functions/data/fetch-opted-in-workspace-member-ids.util',
  () => ({
    fetchOptedInWorkspaceMemberIds: fetchOptedInWorkspaceMemberIdsMock,
  }),
);

type HandlerBatch = Parameters<
  typeof reconcileCallRecorderCalendarEventParticipantHandler
>[0];

describe('reconcileCallRecorderCalendarEventParticipantHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reconcileMock.mockResolvedValue([]);
    fetchOptedInWorkspaceMemberIdsMock.mockResolvedValue(new Set(['member-1']));
  });

  it('subscribes to participant changes that can move a member in or out of a meeting', () => {
    expect(
      reconcileParticipantLogicFunction.config.databaseEventTriggerSettings,
    ).toEqual({
      eventName: 'calendarEventParticipant.*',
      updatedFields: ['workspaceMemberId', 'calendarEventId'],
      batchMode: true,
    });
  });

  it('reconciles the meetings whose matched attendees changed with the opted-in set', async () => {
    const result = await reconcileCallRecorderCalendarEventParticipantHandler({
      name: 'calendarEventParticipant.updated',
      events: [
        {
          recordId: 'participant-1',
          properties: {
            updatedFields: ['workspaceMemberId'],
            before: {
              id: 'participant-1',
              calendarEventId: 'calendar-event-1',
            },
            after: {
              id: 'participant-1',
              calendarEventId: 'calendar-event-1',
              workspaceMemberId: 'member-1',
            },
          },
        },
      ],
    } as HandlerBatch);

    expect(reconcileMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        calendarEventIds: ['calendar-event-1'],
        optedInWorkspaceMemberIds: new Set(['member-1']),
      }),
    );
    expect(result).toEqual({
      reconciled: true,
      calendarEventIds: ['calendar-event-1'],
      reconciliationResults: [],
    });
  });

  it('skips a batch that only touches unmatched attendees', async () => {
    const result = await reconcileCallRecorderCalendarEventParticipantHandler({
      name: 'calendarEventParticipant.created',
      events: [
        {
          recordId: 'participant-1',
          properties: {
            after: {
              id: 'participant-1',
              calendarEventId: 'calendar-event-1',
              workspaceMemberId: null,
            },
          },
        },
      ],
    } as HandlerBatch);

    expect(result).toEqual({
      skipped: true,
      reason: 'no workspace member attendee change',
    });
    expect(reconcileMock).not.toHaveBeenCalled();
    expect(fetchOptedInWorkspaceMemberIdsMock).not.toHaveBeenCalled();
  });

  it('skips events of other objects', async () => {
    const result = await reconcileCallRecorderCalendarEventParticipantHandler({
      name: 'calendarEvent.updated',
      events: [],
    } as unknown as HandlerBatch);

    expect(result).toEqual({
      skipped: true,
      reason: 'not a calendar event participant',
    });
  });
});
