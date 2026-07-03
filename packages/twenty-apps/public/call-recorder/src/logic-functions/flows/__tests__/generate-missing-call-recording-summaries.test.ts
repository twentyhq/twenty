import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { generateMissingCallRecordingSummaries } from 'src/logic-functions/flows/generate-missing-call-recording-summaries.util';

const generateCallRecordingSummaryMock = vi.hoisted(() => vi.fn());
const requestContinuationMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/flows/generate-call-recording-summary.util',
  () => ({
    generateCallRecordingSummary: generateCallRecordingSummaryMock,
  }),
);

vi.mock(
  'src/logic-functions/data/request-call-recording-summaries-continuation.util',
  () => ({
    requestCallRecordingSummariesContinuation: requestContinuationMock,
  }),
);

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    mutation: vi.fn(),
    query: vi.fn(),
  },
);

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
    generateCallRecordingSummaryMock.mockResolvedValue({
      outcome: 'generated',
    });
    requestContinuationMock.mockResolvedValue(true);
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
    expect(requestContinuationMock).not.toHaveBeenCalled();
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
    expect(requestContinuationMock).toHaveBeenCalledWith({
      callRecordingIds: ['call-recording-2'],
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
    expect(requestContinuationMock).toHaveBeenCalledWith({
      callRecordingIds: ['call-recording-3', 'call-recording-4'],
    });
  });

  it('separates empty summaries from thrown generation errors', async () => {
    generateCallRecordingSummaryMock
      .mockResolvedValueOnce({ outcome: 'empty-summary' })
      .mockRejectedValueOnce(new Error('agent exploded'))
      .mockResolvedValueOnce({ outcome: 'generated' });

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
    generateCallRecordingSummaryMock
      .mockResolvedValueOnce({ outcome: 'already-summarized' })
      .mockResolvedValueOnce({ outcome: 'no-transcript' });

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
    generateCallRecordingSummaryMock
      .mockResolvedValueOnce({ outcome: 'generated' })
      .mockResolvedValueOnce({ outcome: 'disabled' });

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
    expect(requestContinuationMock).not.toHaveBeenCalled();
    expect(generateCallRecordingSummaryMock).toHaveBeenCalledTimes(2);
  });
});
