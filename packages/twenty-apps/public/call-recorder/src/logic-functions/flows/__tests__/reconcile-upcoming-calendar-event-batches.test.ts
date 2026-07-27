import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH } from 'src/constants/reconcile-upcoming-calendar-events-route-path';
import { reconcileUpcomingCalendarEventBatches } from 'src/logic-functions/flows/reconcile-upcoming-calendar-event-batches.util';

const queryMock = vi.fn();
const mutationMock = vi.fn();
const fetchMock = vi.fn();

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    mutation: mutationMock,
    query: queryMock,
  },
);

const MEETING_URL = 'https://meet.google.com/abc';
const MEETING_STARTS_AT = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const MEETING_ENDS_AT = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

type CalendarEventNode = {
  id: string;
  title: string;
  isCanceled: boolean;
  startsAt: string;
  endsAt: string;
  conferenceLink: { primaryLinkUrl: string } | null;
};

type CallRecordingNode = {
  id: string;
  status: string;
  recordingRequestStatus: string | null;
  calendarEventId?: string;
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
  callRecordings?: {
    __args: {
      filter: {
        id?: { in: string[] };
        calendarEventId?: { in: string[] };
      };
    };
  };
};

type RecordsMutation = {
  createCallRecording?: {
    __args: { data: { id: string; calendarEventId: string } };
  };
  updateCallRecording?: { __args: { id: string } };
};

const buildConnection = <TNode>(nodes: TNode[]) => ({
  pageInfo: { hasNextPage: false, endCursor: null },
  edges: nodes.map((node) => ({ node })),
});

const buildCalendarEventNode = (
  id: string,
  overrides: Partial<CalendarEventNode> = {},
): CalendarEventNode => ({
  id,
  title: 'Customer Sync',
  isCanceled: false,
  startsAt: MEETING_STARTS_AT,
  endsAt: MEETING_ENDS_AT,
  conferenceLink: { primaryLinkUrl: MEETING_URL },
  ...overrides,
});

const seedClientQueries = ({
  calendarEventNodesById = {},
  callRecordingNodesByCalendarEventId = {},
  hasExistingPolicyManagedCallRecordings = false,
}: {
  calendarEventNodesById?: Record<string, CalendarEventNode>;
  callRecordingNodesByCalendarEventId?: Record<string, CallRecordingNode[]>;
  hasExistingPolicyManagedCallRecordings?: boolean;
} = {}): void => {
  queryMock.mockImplementation(async (query: RecordsQuery) => {
    if (query.calendarEvents !== undefined) {
      const filter = query.calendarEvents.__args.filter;

      if (filter.id !== undefined) {
        return {
          calendarEvents: buildConnection(
            filter.id.in.map(
              (calendarEventId) =>
                calendarEventNodesById[calendarEventId] ??
                buildCalendarEventNode(calendarEventId),
            ),
          ),
        };
      }

      return { calendarEvents: buildConnection([]) };
    }

    if (query.callRecordings !== undefined) {
      const filter = query.callRecordings.__args.filter;

      if (filter.calendarEventId !== undefined) {
        return {
          callRecordings: buildConnection(
            filter.calendarEventId.in.flatMap(
              (calendarEventId) =>
                callRecordingNodesByCalendarEventId[calendarEventId] ?? [],
            ),
          ),
        };
      }

      return {
        callRecordings: buildConnection(
          hasExistingPolicyManagedCallRecordings
            ? (filter.id?.in ?? []).map((callRecordingId) => ({
                id: callRecordingId,
                status: 'SCHEDULED',
                recordingRequestStatus: 'REQUESTED',
              }))
            : [],
        ),
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  });
};

const seedClientMutations = ({
  failingCreateCalendarEventId,
}: {
  failingCreateCalendarEventId?: string;
} = {}): void => {
  mutationMock.mockImplementation(async (mutation: RecordsMutation) => {
    if (mutation.createCallRecording !== undefined) {
      const data = mutation.createCallRecording.__args.data;

      if (data.calendarEventId === failingCreateCalendarEventId) {
        throw new Error('createCallRecording rejected');
      }

      return { createCallRecording: { id: data.id } };
    }

    if (mutation.updateCallRecording !== undefined) {
      return {
        updateCallRecording: { id: mutation.updateCallRecording.__args.id },
      };
    }

    throw new Error(`Unhandled mutation: ${JSON.stringify(mutation)}`);
  });
};

const readBatchCalendarEventIdFilters = (): string[][] =>
  queryMock.mock.calls
    .map(([query]) => query.calendarEvents?.__args.filter.id?.in)
    .filter(
      (requestedIds): requestedIds is string[] =>
        requestedIds !== undefined && requestedIds.length > 1,
    );

const buildCalendarEventIds = (count: number): string[] =>
  Array.from({ length: count }, (_, index) => `calendar-event-${index + 1}`);

describe('reconcileUpcomingCalendarEventBatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://acme.functions.example.com');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-access-token');
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    seedClientQueries();
    seedClientMutations();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('reconciles every batch when the deadline is far away', async () => {
    const calendarEventIds = buildCalendarEventIds(30);

    const result = await reconcileUpcomingCalendarEventBatches({
      client: CLIENT,
      calendarEventIds,
      deadlineAtMs: Date.now() + 60_000,
    });

    expect(readBatchCalendarEventIdFilters()).toEqual([
      [...calendarEventIds.slice(0, 25)].sort(),
      [...calendarEventIds.slice(25)].sort(),
    ]);
    expect(result.reconciledCalendarEventIds).toEqual(calendarEventIds);
    expect(result.remainingCalendarEventIds).toEqual([]);
    expect(result.actionCounts).toEqual({
      created: 2,
      updated: 0,
      canceled: 0,
      skipped: 0,
      failed: 0,
    });
    expect(result.continuationRequested).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('stops at the deadline and requests a continuation with the remaining ids', async () => {
    const calendarEventIds = buildCalendarEventIds(30);
    // Clock advances 5s per reading: after one batch, 15s + 5s overshoots the deadline.
    let nowMs = 0;
    const getNowMs = () => {
      nowMs += 5_000;

      return nowMs;
    };

    const result = await reconcileUpcomingCalendarEventBatches({
      client: CLIENT,
      calendarEventIds,
      deadlineAtMs: 15_000,
      getNowMs,
    });

    expect(readBatchCalendarEventIdFilters()).toEqual([
      [...calendarEventIds.slice(0, 25)].sort(),
    ]);
    expect(result.reconciledCalendarEventIds).toEqual(
      calendarEventIds.slice(0, 25),
    );
    expect(result.remainingCalendarEventIds).toEqual(
      calendarEventIds.slice(25),
    );
    expect(result.continuationRequested).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe(
      `https://acme.functions.example.com${RECONCILE_UPCOMING_CALENDAR_EVENTS_ROUTE_PATH}`,
    );
    expect(requestInit.method).toBe('POST');
    expect(requestInit.body).toBe(
      JSON.stringify({ calendarEventIds: calendarEventIds.slice(25) }),
    );
  });

  it('records a failed batch and keeps processing the next one', async () => {
    const calendarEventIds = buildCalendarEventIds(30);

    seedClientQueries({ hasExistingPolicyManagedCallRecordings: true });
    queryMock.mockRejectedValueOnce(new Error('core api unavailable'));

    const result = await reconcileUpcomingCalendarEventBatches({
      client: CLIENT,
      calendarEventIds,
      deadlineAtMs: Date.now() + 60_000,
    });

    expect(result.failedCalendarEventIds).toEqual(calendarEventIds.slice(0, 25));
    expect(result.reconciledCalendarEventIds).toEqual(
      calendarEventIds.slice(25),
    );
    expect(result.remainingCalendarEventIds).toEqual([]);
    expect(result.actionCounts).toEqual({
      created: 0,
      updated: 1,
      canceled: 0,
      skipped: 0,
      failed: 0,
    });
    expect(result.continuationRequested).toBe(false);
  });

  it('tallies every reconciliation action kind', async () => {
    seedClientQueries({
      calendarEventNodesById: {
        'calendar-event-1': buildCalendarEventNode('calendar-event-1', {
          conferenceLink: {
            primaryLinkUrl: 'https://meet.google.com/created',
          },
        }),
        'calendar-event-2': buildCalendarEventNode('calendar-event-2', {
          isCanceled: true,
          conferenceLink: {
            primaryLinkUrl: 'https://meet.google.com/canceled',
          },
        }),
        'calendar-event-3': buildCalendarEventNode('calendar-event-3', {
          isCanceled: true,
          conferenceLink: {
            primaryLinkUrl: 'https://meet.google.com/skipped',
          },
        }),
        'calendar-event-4': buildCalendarEventNode('calendar-event-4', {
          conferenceLink: {
            primaryLinkUrl: 'https://meet.google.com/failed',
          },
        }),
      },
      callRecordingNodesByCalendarEventId: {
        'calendar-event-2': [
          {
            id: 'call-recording-2',
            status: 'SCHEDULED',
            recordingRequestStatus: 'REQUESTED',
            calendarEventId: 'calendar-event-2',
          },
        ],
      },
    });
    seedClientMutations({
      failingCreateCalendarEventId: 'calendar-event-4',
    });

    const result = await reconcileUpcomingCalendarEventBatches({
      client: CLIENT,
      calendarEventIds: buildCalendarEventIds(4),
      deadlineAtMs: Date.now() + 60_000,
    });

    expect(result.actionCounts).toEqual({
      created: 1,
      updated: 0,
      canceled: 1,
      skipped: 1,
      failed: 1,
    });
  });
});
