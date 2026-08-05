import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/generate-call-recording-summary-job-logic-function-universal-identifier';
import { ENQUEUED_JOB_RETRY_LIMIT } from 'src/logic-functions/constants/enqueued-job-retry-limit';
import { SUMMARY_JOB_STAGGER_MILLISECONDS } from 'src/logic-functions/constants/summary-job-stagger-milliseconds';
import { generateMissingCallRecordingSummaries } from 'src/logic-functions/flows/generate-missing-call-recording-summaries.util';

const runAgentMock = vi.hoisted(() => vi.fn());
const enqueueJobMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
  enqueueJob: enqueueJobMock,
}));

const TRANSCRIPT = [
  {
    participant: { name: 'Alex' },
    words: [{ text: 'Hello' }, { text: 'team' }],
  },
];

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
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'true');
    vi.stubEnv('CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT', '');
    enqueueJobMock.mockImplementation(
      async ({ logicFunctionUniversalIdentifier }) => ({
        enqueued: true,
        logicFunctionUniversalIdentifier,
      }),
    );
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
    expect(enqueueJobMock).not.toHaveBeenCalled();
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
    expect(enqueueJobMock).toHaveBeenCalledTimes(1);
    expect(enqueueJobMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { callRecordingId: 'call-recording-2' },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: 0,
    });
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
    expect(enqueueJobMock).toHaveBeenCalledTimes(2);
    expect(enqueueJobMock).toHaveBeenNthCalledWith(1, {
      logicFunctionUniversalIdentifier:
        GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { callRecordingId: 'call-recording-3' },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: 0,
    });
    expect(enqueueJobMock).toHaveBeenNthCalledWith(2, {
      logicFunctionUniversalIdentifier:
        GENERATE_CALL_RECORDING_SUMMARY_JOB_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payload: { callRecordingId: 'call-recording-4' },
      retryLimit: ENQUEUED_JOB_RETRY_LIMIT,
      delayMs: SUMMARY_JOB_STAGGER_MILLISECONDS,
    });
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
    expect(enqueueJobMock).not.toHaveBeenCalled();
    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(runAgentMock).toHaveBeenCalledTimes(1);
  });
});
