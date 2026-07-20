import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import sweepLogicFunction, {
  sweepUpcomingCalendarEventsHandler,
} from 'src/logic-functions/sweep-upcoming-calendar-events';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

const fetchMock = vi.fn();

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
        isCanceled?: { eq: boolean };
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

describe('sweepUpcomingCalendarEventsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://acme.functions.example.com');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-access-token');
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
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
          calendarEvents: buildConnection(
            upcomingCalendarEventNodes.map(({ id }) => ({ id })),
          ),
        };
      }

      if (query.callRecordings !== undefined) {
        return { callRecordings: buildConnection([]) };
      }

      throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('is configured as a daily cron with a self-invokable timeout', () => {
    expect(sweepLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'sweep-upcoming-calendar-events',
        timeoutSeconds: 900,
        cronTriggerSettings: { pattern: '0 4 * * *' },
      }),
    );
  });

  it('reconciles every upcoming calendar event within the horizon', async () => {
    upcomingCalendarEventNodes = [
      buildUpcomingCalendarEventNode('calendar-event-1'),
      buildUpcomingCalendarEventNode('calendar-event-2'),
    ];

    const result = await sweepUpcomingCalendarEventsHandler();

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEvents: expect.objectContaining({
          __args: expect.objectContaining({
            filter: expect.objectContaining({ isCanceled: { eq: false } }),
          }),
        }),
      }),
    );
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
      failedCalendarEventIds: [],
      remainingCalendarEventIds: [],
      actionCounts: {
        created: 0,
        updated: 0,
        canceled: 0,
        skipped: 2,
        failed: 0,
      },
      continuationRequested: false,
    });
  });

  it('short-circuits without running batches when nothing is upcoming', async () => {
    const result = await sweepUpcomingCalendarEventsHandler();

    expect(result).toEqual({ outcome: 'nothing-to-reconcile' });
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('passes a deadline that reserves time for the continuation request', async () => {
    upcomingCalendarEventNodes = [
      buildUpcomingCalendarEventNode('calendar-event-1'),
    ];

    const result = await sweepUpcomingCalendarEventsHandler();

    expect(result).toEqual(
      expect.objectContaining({
        outcome: 'processed',
        remainingCalendarEventIds: [],
        continuationRequested: false,
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
