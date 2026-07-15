import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { generateMissingCallRecordingSummaries } from 'src/logic-functions/flows/generate-missing-call-recording-summaries.util';

const runAgentMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
}));

const FUNCTIONS_BASE_URL = 'https://acme.functions.example.com';

const TRANSCRIPT = [
  {
    participant: { name: 'Alex' },
    words: [{ text: 'Hello' }, { text: 'team' }],
  },
];

const fetchMock = vi.fn();
const queryMock = vi.fn();
const mutationMock = vi.fn();

const CLIENT = {
  query: queryMock,
  mutation: mutationMock,
} as unknown as CoreApiClient;

const buildCallRecordingNode = (id: string, overrides: object = {}) => ({
  id,
  title: 'Weekly sync',
  transcript: TRANSCRIPT,
  summary: { markdown: null },
  createdBy: { source: 'APPLICATION', name: 'Call Recorder' },
  ...overrides,
});

const seedCallRecordingQueries = (nodesById: Record<string, object>) => {
  queryMock.mockImplementation(async (queryShape: unknown) => {
    const callRecordingId = (
      queryShape as {
        callRecordings: { __args: { filter: { id: { eq: string } } } };
      }
    ).callRecordings.__args.filter.id.eq;
    const node = nodesById[callRecordingId];

    return {
      callRecordings: { edges: node === undefined ? [] : [{ node }] },
    };
  });
};

// Each processed item advances the clock by ITEM_MS across the three
// getNowMs reads of one loop iteration.
const buildClock = (itemMs: number) => {
  let nowMs = 0;
  let reads = 0;

  return () => {
    reads += 1;
    if (reads % 3 === 2) {
      nowMs += itemMs;
    }

    return nowMs;
  };
};

describe('generateMissingCallRecordingSummaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('TWENTY_FUNCTIONS_URL', FUNCTIONS_BASE_URL);
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-access-token');
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'true');
    vi.stubEnv('CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT', '');
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    mutationMock.mockResolvedValue({});
    runAgentMock.mockResolvedValue({
      success: true,
      error: null,
      result: { response: '## Overview\nGood call.' },
    });
    seedCallRecordingQueries({
      'call-recording-1': buildCallRecordingNode('call-recording-1'),
      'call-recording-2': buildCallRecordingNode('call-recording-2'),
      'call-recording-3': buildCallRecordingNode('call-recording-3'),
      'call-recording-4': buildCallRecordingNode('call-recording-4'),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('processes every id and skips the continuation when the budget allows', async () => {
    const result = await generateMissingCallRecordingSummaries({
      client: CLIENT,
      callRecordingIds: ['call-recording-1', 'call-recording-2'],
      deadlineAtMs: 1_000_000,
      getNowMs: buildClock(10),
    });

    expect(result).toEqual({
      generatedCallRecordingIds: ['call-recording-1', 'call-recording-2'],
      failedCallRecordingIds: [],
      erroredCallRecordingIds: [],
      skippedCallRecordingIds: [],
      remainingCallRecordingIds: [],
      continuationRequested: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('always processes at least one id even when the deadline already passed', async () => {
    const result = await generateMissingCallRecordingSummaries({
      client: CLIENT,
      callRecordingIds: ['call-recording-1', 'call-recording-2'],
      deadlineAtMs: 0,
      getNowMs: buildClock(10),
    });

    expect(result.generatedCallRecordingIds).toEqual(['call-recording-1']);
    expect(result.remainingCallRecordingIds).toEqual(['call-recording-2']);
    expect(result.continuationRequested).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe(
      `${FUNCTIONS_BASE_URL}${GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH}`,
    );
    expect(requestInit.method).toBe('POST');
    expect(requestInit.body).toBe(
      JSON.stringify({ callRecordingIds: ['call-recording-2'] }),
    );
  });

  it('stops when the next item would overrun the deadline and hands off the rest', async () => {
    // 100ms per item against a 250ms deadline: two items fit, the third
    // projected finish (200 + 100) exceeds 250 only after the second item.
    const result = await generateMissingCallRecordingSummaries({
      client: CLIENT,
      callRecordingIds: [
        'call-recording-1',
        'call-recording-2',
        'call-recording-3',
        'call-recording-4',
      ],
      deadlineAtMs: 250,
      getNowMs: buildClock(100),
    });

    expect(result.generatedCallRecordingIds).toEqual([
      'call-recording-1',
      'call-recording-2',
    ]);
    expect(result.remainingCallRecordingIds).toEqual([
      'call-recording-3',
      'call-recording-4',
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    expect(requestUrl).toBe(
      `${FUNCTIONS_BASE_URL}${GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH}`,
    );
    expect(requestInit.body).toBe(
      JSON.stringify({
        callRecordingIds: ['call-recording-3', 'call-recording-4'],
      }),
    );
  });

  it('separates empty summaries from thrown generation errors', async () => {
    runAgentMock
      .mockResolvedValueOnce({
        success: false,
        error: 'no more available credits',
        result: null,
      })
      .mockRejectedValueOnce(new Error('agent exploded'))
      .mockResolvedValueOnce({
        success: true,
        error: null,
        result: { response: '## Overview\nGood call.' },
      });

    const result = await generateMissingCallRecordingSummaries({
      client: CLIENT,
      callRecordingIds: [
        'call-recording-1',
        'call-recording-2',
        'call-recording-3',
      ],
      deadlineAtMs: 1_000_000,
      getNowMs: buildClock(10),
    });

    expect(result).toEqual({
      generatedCallRecordingIds: ['call-recording-3'],
      failedCallRecordingIds: ['call-recording-1'],
      erroredCallRecordingIds: ['call-recording-2'],
      skippedCallRecordingIds: [],
      remainingCallRecordingIds: [],
      continuationRequested: false,
    });
  });

  it('records skip outcomes without treating them as failures', async () => {
    seedCallRecordingQueries({
      'call-recording-1': buildCallRecordingNode('call-recording-1', {
        summary: { markdown: '## Overview\nAlready here.' },
      }),
      'call-recording-2': buildCallRecordingNode('call-recording-2', {
        transcript: { status: 'PENDING' },
      }),
    });

    const result = await generateMissingCallRecordingSummaries({
      client: CLIENT,
      callRecordingIds: ['call-recording-1', 'call-recording-2'],
      deadlineAtMs: 1_000_000,
      getNowMs: buildClock(10),
    });

    expect(result.skippedCallRecordingIds).toEqual([
      'call-recording-1',
      'call-recording-2',
    ]);
    expect(result.failedCallRecordingIds).toEqual([]);
    expect(result.erroredCallRecordingIds).toEqual([]);
  });

  it('stops spending immediately when summaries get disabled mid-run', async () => {
    // Persisting the first summary flips the workspace toggle off, so the
    // second id observes the disabled state.
    mutationMock.mockImplementationOnce(async () => {
      vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'false');

      return {};
    });

    const result = await generateMissingCallRecordingSummaries({
      client: CLIENT,
      callRecordingIds: [
        'call-recording-1',
        'call-recording-2',
        'call-recording-3',
      ],
      deadlineAtMs: 1_000_000,
      getNowMs: buildClock(10),
    });

    expect(result.generatedCallRecordingIds).toEqual(['call-recording-1']);
    expect(result.remainingCallRecordingIds).toEqual(['call-recording-3']);
    expect(result.continuationRequested).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(runAgentMock).toHaveBeenCalledTimes(1);
  });
});
