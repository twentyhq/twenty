import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import { GENERATE_CALL_RECORDING_SUMMARIES_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summaries-batch-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
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

const buildSummarizableCallRecordingNode = (
  id: string,
  createdAt = '2026-01-01T00:00:00.000Z',
) => ({
  id,
  createdAt,
  title: 'Weekly sync',
  transcript: TRANSCRIPT,
  summary: { markdown: null },
  createdBy: { source: 'APPLICATION', name: 'Call Recorder' },
});

const seedCallRecordingQueries = ({
  sweepNodes = [],
  calendarEventNodes = [],
  callRecordingsById = {},
}: {
  sweepNodes?: object[];
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

    return buildConnection(sweepNodes);
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
    enqueueJobsMock.mockImplementation(async ({ payloads }) => ({
      enqueued: true,
      enqueuedJobsCount: payloads.length,
    }));
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

  it('enqueues batches for recordings missing a summary when no ids are given', async () => {
    seedCallRecordingQueries({
      sweepNodes: [
        buildSummarizableCallRecordingNode(
          'call-recording-1',
          '2026-01-02T00:00:00.000Z',
        ),
        buildSummarizableCallRecordingNode(
          'call-recording-2',
          '2026-01-01T00:00:00.000Z',
        ),
      ],
    });

    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload(null),
    );

    expect(queriedCallRecordingFilters()).toEqual([
      {
        status: { eq: 'COMPLETED' },
        transcript: { is: 'NOT_NULL' },
        createdBy: {
          source: { eq: 'APPLICATION' },
          name: { eq: 'Call Recorder' },
        },
      },
    ]);
    expect(enqueueJobsMock).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        GENERATE_CALL_RECORDING_SUMMARIES_BATCH_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [
        { callRecordingIds: ['call-recording-1', 'call-recording-2'] },
      ],
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
    });
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      outcome: 'backfill-enqueued',
      callRecordingCount: 2,
      batchCount: 1,
    });
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

  it('short-circuits an empty backfill without enqueuing', async () => {
    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload({}),
    );

    expect(result).toEqual({ outcome: 'nothing-to-summarize' });
    expect(queriedCallRecordingFilters()).toEqual([
      expect.objectContaining({ status: { eq: 'COMPLETED' } }),
    ]);
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
