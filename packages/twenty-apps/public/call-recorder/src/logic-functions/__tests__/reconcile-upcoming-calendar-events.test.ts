import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import routeLogicFunction, {
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

const readSweepQueries = (): unknown[] =>
  queryMock.mock.calls.filter(
    ([query]) => query.calendarEvents?.__args.filter.isCanceled !== undefined,
  );

let upcomingCalendarEventNodes: CalendarEventNode[];

const buildRoutePayload = (
  body: object | null,
): RoutePayload<{ calendarEventIds?: string[] }> =>
  ({
    body,
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    isBase64Encoded: false,
    rawBody: undefined,
    requestContext: { http: { method: 'POST', path: '/' } },
    userWorkspaceId: null,
  }) as never;

const BATCH_RESULT = {
  reconciledCalendarEventIds: ['calendar-event-1'],
  failedCalendarEventIds: [],
  remainingCalendarEventIds: [],
  actionCounts: { created: 0, updated: 0, canceled: 0, skipped: 1, failed: 0 },
  continuationRequested: false,
};

describe('reconcileUpcomingCalendarEventsHandler', () => {
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

  it('is configured as an authenticated route with a self-invokable timeout', () => {
    expect(routeLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'reconcile-upcoming-calendar-events',
        timeoutSeconds: 900,
        httpRouteTriggerSettings: {
          path: '/call-recorder/reconcile-upcoming-calendar-events',
          httpMethod: 'POST',
          isAuthRequired: true,
        },
      }),
    );
  });

  it('processes explicit calendar event ids without sweeping', async () => {
    upcomingCalendarEventNodes = [
      buildUpcomingCalendarEventNode('calendar-event-1'),
    ];

    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({ calendarEventIds: ['calendar-event-1'] }),
    );

    expect(result).toEqual({ outcome: 'processed', ...BATCH_RESULT });
    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEvents: expect.objectContaining({
          __args: expect.objectContaining({
            filter: { id: { in: ['calendar-event-1'] } },
          }),
        }),
      }),
    );
    expect(readSweepQueries()).toEqual([]);
  });

  it('sweeps upcoming calendar events when no ids are given', async () => {
    upcomingCalendarEventNodes = [
      buildUpcomingCalendarEventNode('calendar-event-1'),
      buildUpcomingCalendarEventNode('calendar-event-2'),
    ];

    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload(null),
    );

    expect(readSweepQueries()).toHaveLength(1);
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

  it('short-circuits an empty sweep without running batches', async () => {
    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({}),
    );

    expect(result).toEqual({ outcome: 'nothing-to-reconcile' });
    expect(queryMock).toHaveBeenCalledTimes(1);
  });

  it('does not sweep when an empty calendar event selection is sent', async () => {
    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({ calendarEventIds: [] }),
    );

    expect(result).toEqual({ outcome: 'nothing-selected' });
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('passes a deadline that reserves time for the continuation request', async () => {
    upcomingCalendarEventNodes = [
      buildUpcomingCalendarEventNode('calendar-event-1'),
    ];

    const result = await reconcileUpcomingCalendarEventsHandler(
      buildRoutePayload({ calendarEventIds: ['calendar-event-1'] }),
    );

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
