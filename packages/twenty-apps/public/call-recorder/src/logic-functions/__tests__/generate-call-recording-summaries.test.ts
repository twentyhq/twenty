import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import { generateCallRecordingSummariesHandler } from 'src/logic-functions/generate-call-recording-summaries';

const queryMock = vi.hoisted(() => vi.fn());
const mutationMock = vi.hoisted(() => vi.fn());
const runAgentMock = vi.hoisted(() => vi.fn());
const enqueueJobsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
  enqueueJobs: enqueueJobsMock,
}));

const buildRoutePayload = (
  body: object | null,
): RoutePayload<{ callRecordingIds?: string[]; calendarEventIds?: string[] }> =>
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

const TRANSCRIPT = [
  {
    participant: { name: 'Alex' },
    words: [{ text: 'Hello' }, { text: 'team' }],
  },
];

type CallRecordingsQueryShape = {
  callRecordings: {
    __args: {
      filter: {
        id?: { eq: string };
        calendarEventId?: { in: string[] };
      };
    };
  };
};

const buildConnection = (nodes: object[]) => ({
  callRecordings: {
    pageInfo: { hasNextPage: false, endCursor: null },
    edges: nodes.map((node) => ({ node })),
  },
});

const buildSummarizableCallRecordingNode = (id: string) => ({
  id,
  createdAt: '2026-01-01T00:00:00.000Z',
  title: 'Weekly sync',
  transcript: TRANSCRIPT,
  summary: { markdown: null },
  createdBy: { source: 'APPLICATION', name: 'Call Recorder' },
});

const seedCallRecordingQueries = ({
  calendarEventNodes = [],
  callRecordingsById = {},
}: {
  calendarEventNodes?: object[];
  callRecordingsById?: Record<string, object>;
} = {}) => {
  queryMock.mockImplementation(async (queryShape: unknown) => {
    const filter = (queryShape as CallRecordingsQueryShape).callRecordings
      .__args.filter;

    if (filter.id !== undefined) {
      const node = callRecordingsById[filter.id.eq];

      return {
        callRecordings: { edges: node === undefined ? [] : [{ node }] },
      };
    }

    if (filter.calendarEventId !== undefined) {
      return buildConnection(calendarEventNodes);
    }

    return buildConnection([]);
  });
};

const queriedCallRecordingFilters = (): unknown[] =>
  queryMock.mock.calls.map(
    ([queryShape]) =>
      (queryShape as CallRecordingsQueryShape).callRecordings.__args.filter,
  );

const BATCH_RESULT = {
  generatedCallRecordingIds: ['call-recording-1'],
  failedCallRecordingIds: [],
  erroredCallRecordingIds: [],
  skippedCallRecordingIds: [],
  unavailableCallRecordingIds: [],
};

describe('generateCallRecordingSummariesHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'true');
    vi.stubEnv('CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT', '');
    mutationMock.mockResolvedValue({});
    runAgentMock.mockResolvedValue({
      success: true,
      error: null,
      result: { response: '## Overview\nGood call.' },
    });
    seedCallRecordingQueries();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns disabled without touching data when summaries are off', async () => {
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'false');

    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload(null),
    );

    expect(result).toEqual({ outcome: 'disabled' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('processes explicit call recording ids inline without enqueuing', async () => {
    seedCallRecordingQueries({
      callRecordingsById: {
        'call-recording-1':
          buildSummarizableCallRecordingNode('call-recording-1'),
      },
    });

    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload({ callRecordingIds: ['call-recording-1'] }),
    );

    expect(result).toEqual({ outcome: 'processed', ...BATCH_RESULT });
    expect(queriedCallRecordingFilters()).toEqual([
      { id: { eq: 'call-recording-1' } },
    ]);
    expect(enqueueJobsMock).not.toHaveBeenCalled();
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecording: {
        __args: {
          id: 'call-recording-1',
          data: {
            summary: { blocknote: null, markdown: '## Overview\nGood call.' },
          },
        },
        id: true,
      },
    });
  });

  it('resolves calendar event ids to their call recordings', async () => {
    seedCallRecordingQueries({
      calendarEventNodes: [{ id: 'call-recording-7' }],
      callRecordingsById: {
        'call-recording-7':
          buildSummarizableCallRecordingNode('call-recording-7'),
      },
    });

    await generateCallRecordingSummariesHandler(
      buildRoutePayload({ calendarEventIds: ['calendar-event-1'] }),
    );

    expect(queriedCallRecordingFilters()).toEqual([
      { calendarEventId: { in: ['calendar-event-1'] } },
      { id: { eq: 'call-recording-7' } },
    ]);
    expect(mutationMock).toHaveBeenCalledWith(
      expect.objectContaining({
        updateCallRecording: expect.objectContaining({
          __args: expect.objectContaining({ id: 'call-recording-7' }),
        }),
      }),
    );
  });

  it('regenerates an existing summary when requested from a calendar event', async () => {
    seedCallRecordingQueries({
      calendarEventNodes: [{ id: 'call-recording-1' }],
      callRecordingsById: {
        'call-recording-1': {
          ...buildSummarizableCallRecordingNode('call-recording-1'),
          summary: { markdown: '## Overview\nOld summary.' },
        },
      },
    });

    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload({ calendarEventIds: ['calendar-event-1'] }),
    );

    expect(result).toEqual({ outcome: 'processed', ...BATCH_RESULT });
    expect(runAgentMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledTimes(1);
  });

  it('reports when the selected calendar events have no recordings instead of enqueuing', async () => {
    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload({ calendarEventIds: ['calendar-event-1'] }),
    );

    expect(result).toEqual({
      outcome: 'no-call-recordings-for-calendar-events',
    });
    expect(queriedCallRecordingFilters()).toEqual([
      { calendarEventId: { in: ['calendar-event-1'] } },
    ]);
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('returns nothing-selected when no ids are given instead of sweeping history', async () => {
    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload(null),
    );

    expect(result).toEqual({ outcome: 'nothing-selected' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('does not enqueue when an empty calendar event selection is sent', async () => {
    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload({ calendarEventIds: [] }),
    );

    expect(result).toEqual({ outcome: 'nothing-selected' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });

  it('returns nothing-selected for an empty body', async () => {
    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload({}),
    );

    expect(result).toEqual({ outcome: 'nothing-selected' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
