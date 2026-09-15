import { beforeEach, describe, expect, it, vi } from 'vitest';

import reconcileLogicFunction, {
  reconcileUpcomingCalendarEventsHandler,
} from 'src/logic-functions/reconcile-upcoming-calendar-events';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

type CalendarEventNode = {
  id: string;
  title: string;
  isCanceled: boolean;
  startsAt: string;
  endsAt: string;
};

type RecordsQuery = {
  calendarEvents?: {
    __args: {
      filter: {
        id?: { in: string[] };
        startsAt?: { in: string[] };
      };
    };
  };
  callRecordings?: { __args: { filter: Record<string, unknown> } };
};

const UPCOMING_STARTS_AT = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const UPCOMING_ENDS_AT = new Date(
  Date.now() + 2 * 60 * 60 * 1000,
).toISOString();

// Without a conference link the policy deterministically skips each meeting.
const buildUpcomingCalendarEventNode = (id: string): CalendarEventNode => ({
  id,
  title: 'Upcoming Sync',
  isCanceled: false,
  startsAt: UPCOMING_STARTS_AT,
  endsAt: UPCOMING_ENDS_AT,
});

const buildConnection = <TNode>(nodes: TNode[]) => ({
  pageInfo: { hasNextPage: false, endCursor: null },
  edges: nodes.map((node) => ({ node })),
});

let upcomingCalendarEventNodes: CalendarEventNode[];

describe('reconcileUpcomingCalendarEventsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upcomingCalendarEventNodes = [];
    queryMock.mockImplementation(async (query: RecordsQuery) => {
      if (query.calendarEvents !== undefined) {
        const filter = query.calendarEvents.__args.filter;

        if (filter.id !== undefined) {
          const requestedIds = filter.id.in;

          return {
            calendarEvents: buildConnection(
              upcomingCalendarEventNodes.filter((node) =>
                requestedIds.includes(node.id),
              ),
            ),
          };
        }

        if (filter.startsAt !== undefined) {
          const requestedStartsAtValues = filter.startsAt.in;

          return {
            calendarEvents: buildConnection(
              upcomingCalendarEventNodes.filter((node) =>
                requestedStartsAtValues.includes(node.startsAt),
              ),
            ),
          };
        }

        return {
          calendarEvents: buildConnection(upcomingCalendarEventNodes),
        };
      }

      if (query.callRecordings !== undefined) {
        return { callRecordings: buildConnection([]) };
      }

      throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
    });
  });

  it('is configured as an enqueue-only batch worker', () => {
    expect(reconcileLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'reconcile-upcoming-calendar-events',
        timeoutSeconds: 900,
      }),
    );
    expect(reconcileLogicFunction.config).not.toHaveProperty(
      'httpRouteTriggerSettings',
    );
    expect(reconcileLogicFunction.config).not.toHaveProperty(
      'cronTriggerSettings',
    );
  });

  it('reconciles the calendar events of its batch payload', async () => {
    upcomingCalendarEventNodes = [
      buildUpcomingCalendarEventNode('calendar-event-1'),
      buildUpcomingCalendarEventNode('calendar-event-2'),
    ];

    const result = await reconcileUpcomingCalendarEventsHandler({
      calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
    });

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEvents: expect.objectContaining({
          __args: expect.objectContaining({
            filter: { id: { in: ['calendar-event-1', 'calendar-event-2'] } },
          }),
        }),
      }),
    );
    expect(result).toEqual({
      outcome: 'processed',
      reconciledCalendarEventIds: ['calendar-event-1', 'calendar-event-2'],
      actionCounts: {
        created: 0,
        updated: 0,
        canceled: 0,
        skipped: 2,
        failed: 0,
      },
    });
  });

  it('skips payloads without calendar event ids', async () => {
    expect(await reconcileUpcomingCalendarEventsHandler({})).toEqual({
      outcome: 'nothing-selected',
    });
    expect(await reconcileUpcomingCalendarEventsHandler(null)).toEqual({
      outcome: 'nothing-selected',
    });
    expect(
      await reconcileUpcomingCalendarEventsHandler({ calendarEventIds: [] }),
    ).toEqual({ outcome: 'nothing-selected' });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('rethrows a batch failure as retryable so the queue redelivers it', async () => {
    queryMock.mockRejectedValue(new Error('Service unavailable'));

    await expect(
      reconcileUpcomingCalendarEventsHandler({
        calendarEventIds: ['calendar-event-1'],
      }),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Service unavailable'),
    });
  });
});
