import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { retryFailedRecallCancellations } from 'src/logic-functions/flows/retry-failed-recall-cancellations.util';

const BASE_URL = 'https://us-west-2.recall.ai/api/v1';
const NOW = new Date('2026-01-01T12:00:00.000Z');
const WORKSPACE_ID = '123e4567-e89b-12d3-a456-426614174000';

const buildAccessToken = (payload: Record<string, unknown>): string =>
  [
    Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');

type CallRecordingNode = {
  id: string;
  recordingRequestStatus?: string | null;
  status?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  calendarEventId?: string | null;
  externalBotId?: string | null;
};

type CalendarEventNode = {
  id: string;
  startsAt?: string | null;
  endsAt?: string | null;
};

class FakeCoreApiClient {
  callRecordings: CallRecordingNode[];
  callRecordingQueryResponses: CallRecordingNode[][] = [];
  calendarEvents: CalendarEventNode[];
  filters: Array<Record<string, unknown>> = [];
  conditionalMutationFilters: Array<Record<string, unknown>> = [];
  mutations: Array<{ id: string; data: Record<string, unknown> }> = [];

  constructor(
    callRecordings: CallRecordingNode[],
    calendarEvents: CalendarEventNode[] = [],
  ) {
    this.callRecordings = callRecordings;
    this.calendarEvents = calendarEvents;
  }

  async query(query: any): Promise<any> {
    if (query.callRecordings !== undefined) {
      this.filters.push(query.callRecordings.__args.filter);

      return {
        callRecordings: buildConnection(
          this.callRecordingQueryResponses.shift() ?? this.callRecordings,
        ),
      };
    }

    if (query.calendarEvents !== undefined) {
      const calendarEventIds = query.calendarEvents.__args.filter.id.in;

      return {
        calendarEvents: buildConnection(
          this.calendarEvents.filter((calendarEvent) =>
            calendarEventIds.includes(calendarEvent.id),
          ),
        ),
      };
    }

    throw new Error(`Unhandled query: ${JSON.stringify(query)}`);
  }

  async mutation(mutation: any): Promise<any> {
    if (mutation.updateCallRecordings !== undefined) {
      const { filter, data } = mutation.updateCallRecordings.__args;

      this.conditionalMutationFilters.push(filter);

      const matchingCallRecordings = this.callRecordings.filter(
        (callRecording) =>
          callRecording.id === filter.id.eq &&
          callRecording.recordingRequestStatus ===
            filter.recordingRequestStatus.eq &&
          filter.status.in.includes(callRecording.status) &&
          (filter.externalBotId.is === 'NULL'
            ? callRecording.externalBotId === null
            : callRecording.externalBotId === filter.externalBotId.eq),
      );

      matchingCallRecordings.forEach((callRecording) => {
        this.mutations.push({ id: callRecording.id, data });
        Object.assign(callRecording, data);
      });

      return {
        updateCallRecordings: matchingCallRecordings.map(({ id }) => ({ id })),
      };
    }

    const { id, data } = mutation.updateCallRecording.__args;

    this.mutations.push({ id, data });
    const callRecording = this.callRecordings.find(
      (candidateCallRecording) => candidateCallRecording.id === id,
    );

    if (callRecording !== undefined) {
      Object.assign(callRecording, data);
    }

    return { updateCallRecording: { id } };
  }
}

const buildConnection = <Node>(nodes: Node[]) => ({
  pageInfo: { hasNextPage: false, endCursor: undefined },
  edges: nodes.map((node) => ({ node })),
});

const fetchMock = vi.fn();

const buildJsonResponse = (status: number) => ({
  ok: status < 400,
  status,
  json: async () => ({}),
});

describe('retryFailedRecallCancellations', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
    vi.stubEnv(
      'TWENTY_APP_ACCESS_TOKEN',
      buildAccessToken({ workspaceId: WORKSPACE_ID }),
    );
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => buildJsonResponse(204));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('queries canceled non-terminal recordings including rows missing a bot id', async () => {
    const client = new FakeCoreApiClient([]);

    await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(client.filters).toEqual([
      expect.objectContaining({
        recordingRequestStatus: { eq: 'CANCELED' },
        status: {
          in: ['SCHEDULED', 'JOINING', 'RECORDING', 'PROCESSING'],
        },
      }),
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('cancels the bot and clears the id when the Recall cancel succeeds', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        externalBotId: 'recall-bot-1',
      },
    ]);

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-1/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(client.mutations).toEqual([
      { id: 'call-recording-1', data: { externalBotId: null } },
    ]);
    expect(result.canceledExternalBotCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
  });

  it('keeps the bot id when the Recall cancel fails so the next run retries', async () => {
    fetchMock.mockImplementation(async () => buildJsonResponse(400));
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        externalBotId: 'recall-bot-1',
      },
    ]);

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-1/leave_call/`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(client.mutations).toEqual([]);
    expect(result.canceledExternalBotCallRecordingIds).toEqual([]);
  });

  it('does not cancel a bot after its request was reactivated', async () => {
    const canceledCallRecording = {
      id: 'call-recording-1',
      recordingRequestStatus: 'CANCELED',
      status: 'SCHEDULED',
      externalBotId: 'recall-bot-1',
    };
    const client = new FakeCoreApiClient([canceledCallRecording]);
    client.callRecordingQueryResponses = [
      [canceledCallRecording],
      [
        {
          ...canceledCallRecording,
          recordingRequestStatus: 'REQUESTED',
        },
      ],
    ];

    await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('recovers and cancels a provider bot when endsAt is missing after the meeting starts', async () => {
    const client = new FakeCoreApiClient(
      [
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'CANCELED',
          status: 'SCHEDULED',
          calendarEventId: 'calendar-event-1',
          externalBotId: null,
        },
      ],
      [
        {
          id: 'calendar-event-1',
          startsAt: '2026-01-01T11:00:00.000Z',
          endsAt: null,
        },
      ],
    );
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit?: { method?: string }) => {
        if (requestInit?.method === 'DELETE') {
          return buildJsonResponse(204);
        }

        if (requestUrl.startsWith(`${BASE_URL}/bot/?`)) {
          return {
            ...buildJsonResponse(200),
            json: async () => ({
              next: null,
              results: [
                {
                  id: 'recall-bot-recovered',
                  metadata: {
                    twentyWorkspaceId: WORKSPACE_ID,
                    twentyCallRecordingId: 'call-recording-1',
                  },
                },
              ],
            }),
          };
        }

        throw new Error(`Unhandled fetch: ${requestUrl}`);
      },
    );

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    const listRequestUrl = fetchMock.mock.calls.find(
      ([requestUrl]) =>
        typeof requestUrl === 'string' && requestUrl.includes('/bot/?'),
    )?.[0];
    const listRequestParameters = new URL(listRequestUrl).searchParams;

    expect(listRequestParameters.get('metadata__twentyWorkspaceId')).toBe(
      WORKSPACE_ID,
    );
    expect(listRequestParameters.has('metadata__twentyCallRecordingId')).toBe(
      false,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-recovered/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { externalBotId: 'recall-bot-recovered' },
      },
      { id: 'call-recording-1', data: { externalBotId: null } },
    ]);
    expect(result.canceledExternalBotCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
  });

  it('persists a metadata-recovered bot id when cancellation fails after its calendar event was deleted', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        calendarEventId: 'deleted-calendar-event',
        externalBotId: null,
      },
    ]);
    fetchMock
      .mockResolvedValueOnce({
        ...buildJsonResponse(200),
        json: async () => ({
          next: null,
          results: [
            {
              id: 'recall-bot-recovered',
              metadata: {
                twentyWorkspaceId: WORKSPACE_ID,
                twentyCallRecordingId: 'call-recording-1',
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce(buildJsonResponse(400))
      .mockResolvedValueOnce(buildJsonResponse(400));

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    const listRequestUrl = fetchMock.mock.calls[0][0];
    const listRequestParameters = new URL(listRequestUrl).searchParams;

    expect(listRequestParameters.has('join_at_after')).toBe(false);
    expect(listRequestParameters.has('join_at_before')).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-recovered/leave_call/`,
      expect.objectContaining({ method: 'POST' }),
    );
    expect(client.mutations).toEqual([
      {
        id: 'call-recording-1',
        data: { externalBotId: 'recall-bot-recovered' },
      },
    ]);
    expect(client.callRecordings[0].externalBotId).toBe(
      'recall-bot-recovered',
    );
    expect(client.conditionalMutationFilters).toEqual([
      expect.objectContaining({
        recordingRequestStatus: { eq: 'CANCELED' },
        status: { in: ['SCHEDULED', 'JOINING', 'RECORDING', 'PROCESSING'] },
        externalBotId: { is: 'NULL' },
      }),
    ]);
    expect(result.canceledExternalBotCallRecordingIds).toEqual([]);
  });

  it('stops looking up a botless cancellation without a calendar event once it ages past the recovery window', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        createdAt: '2026-01-01T11:00:00.000Z',
        calendarEventId: null,
        externalBotId: null,
      },
    ]);

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: new Date('2026-01-02T12:00:00.000Z'),
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.canceledExternalBotCallRecordingIds).toEqual([]);
  });

  it('recovers a long-scheduled cancellation whose recent cancellation is within the recovery window', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        createdAt: '2026-01-01T11:00:00.000Z',
        updatedAt: '2026-01-02T11:30:00.000Z',
        calendarEventId: null,
        externalBotId: null,
      },
    ]);
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit?: { method?: string }) => {
        if (requestInit?.method === 'DELETE') {
          return buildJsonResponse(204);
        }

        if (requestUrl.startsWith(`${BASE_URL}/bot/?`)) {
          return {
            ...buildJsonResponse(200),
            json: async () => ({
              next: null,
              results: [
                {
                  id: 'recall-bot-recovered',
                  metadata: {
                    twentyWorkspaceId: WORKSPACE_ID,
                    twentyCallRecordingId: 'call-recording-1',
                  },
                },
              ],
            }),
          };
        }

        throw new Error(`Unhandled fetch: ${requestUrl}`);
      },
    );

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: new Date('2026-01-02T12:00:00.000Z'),
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-recovered/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result.canceledExternalBotCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
  });

  it('still recovers a recently created botless cancellation without a calendar event', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-1',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        createdAt: '2026-01-01T11:00:00.000Z',
        calendarEventId: null,
        externalBotId: null,
      },
    ]);
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit?: { method?: string }) => {
        if (requestInit?.method === 'DELETE') {
          return buildJsonResponse(204);
        }

        if (requestUrl.startsWith(`${BASE_URL}/bot/?`)) {
          return {
            ...buildJsonResponse(200),
            json: async () => ({
              next: null,
              results: [
                {
                  id: 'recall-bot-recovered',
                  metadata: {
                    twentyWorkspaceId: WORKSPACE_ID,
                    twentyCallRecordingId: 'call-recording-1',
                  },
                },
              ],
            }),
          };
        }

        throw new Error(`Unhandled fetch: ${requestUrl}`);
      },
    );

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-recovered/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result.canceledExternalBotCallRecordingIds).toEqual([
      'call-recording-1',
    ]);
  });

  it('does not claim a listed bot for a cancellation whose recovery window elapsed', async () => {
    const client = new FakeCoreApiClient([
      {
        id: 'call-recording-recent',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        createdAt: '2026-01-02T11:30:00.000Z',
        calendarEventId: null,
        externalBotId: null,
      },
      {
        id: 'call-recording-aged',
        recordingRequestStatus: 'CANCELED',
        status: 'SCHEDULED',
        createdAt: '2026-01-01T11:00:00.000Z',
        calendarEventId: null,
        externalBotId: null,
      },
    ]);
    fetchMock.mockImplementation(
      async (requestUrl: string, requestInit?: { method?: string }) => {
        if (requestInit?.method === 'DELETE') {
          return buildJsonResponse(204);
        }

        if (requestUrl.startsWith(`${BASE_URL}/bot/?`)) {
          return {
            ...buildJsonResponse(200),
            json: async () => ({
              next: null,
              results: [
                {
                  id: 'recall-bot-recent',
                  metadata: {
                    twentyWorkspaceId: WORKSPACE_ID,
                    twentyCallRecordingId: 'call-recording-recent',
                  },
                },
                {
                  id: 'recall-bot-aged',
                  metadata: {
                    twentyWorkspaceId: WORKSPACE_ID,
                    twentyCallRecordingId: 'call-recording-aged',
                  },
                },
              ],
            }),
          };
        }

        throw new Error(`Unhandled fetch: ${requestUrl}`);
      },
    );

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: new Date('2026-01-02T12:00:00.000Z'),
    });

    expect(result.canceledExternalBotCallRecordingIds).toEqual([
      'call-recording-recent',
    ]);
    expect(fetchMock).not.toHaveBeenCalledWith(
      `${BASE_URL}/bot/recall-bot-aged/`,
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('does not repeatedly look up botless cancellations after their meeting ended', async () => {
    const client = new FakeCoreApiClient(
      [
        {
          id: 'call-recording-1',
          recordingRequestStatus: 'CANCELED',
          status: 'SCHEDULED',
          calendarEventId: 'calendar-event-1',
          externalBotId: null,
        },
      ],
      [
        {
          id: 'calendar-event-1',
          startsAt: '2026-01-01T10:00:00.000Z',
          endsAt: '2026-01-01T11:00:00.000Z',
        },
      ],
    );

    const result = await retryFailedRecallCancellations({
      client: client as unknown as CoreApiClient,
      now: NOW,
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(client.mutations).toEqual([]);
    expect(result.canceledExternalBotCallRecordingIds).toEqual([]);
  });
});
