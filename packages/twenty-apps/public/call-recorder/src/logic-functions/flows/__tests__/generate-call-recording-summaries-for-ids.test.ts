import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { generateCallRecordingSummariesForIds } from 'src/logic-functions/flows/generate-call-recording-summaries-for-ids.util';

const generateCallRecordingSummaryMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/flows/generate-call-recording-summary.util',
  () => ({
    generateCallRecordingSummary: generateCallRecordingSummaryMock,
  }),
);

const client = {} as CoreApiClient;

describe('generateCallRecordingSummariesForIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateCallRecordingSummaryMock.mockResolvedValue({
      outcome: 'generated',
    });
  });

  it('buckets each call recording by its generation outcome', async () => {
    generateCallRecordingSummaryMock
      .mockResolvedValueOnce({ outcome: 'generated' })
      .mockResolvedValueOnce({ outcome: 'empty-summary' })
      .mockRejectedValueOnce(new Error('agent failed'))
      .mockResolvedValueOnce({ outcome: 'save-error' })
      .mockResolvedValueOnce({ outcome: 'already-summarized' })
      .mockResolvedValueOnce({ outcome: 'not-summarizable' });

    const result = await generateCallRecordingSummariesForIds({
      client,
      callRecordingIds: [
        'call-recording-1',
        'call-recording-2',
        'call-recording-3',
        'call-recording-4',
        'call-recording-5',
        'call-recording-6',
      ],
    });

    expect(result).toEqual({
      generatedCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: ['call-recording-2'],
      erroredCallRecordingIds: ['call-recording-3', 'call-recording-4'],
      skippedCallRecordingIds: ['call-recording-5'],
      unavailableCallRecordingIds: ['call-recording-6'],
    });
  });

  it('stops spending as soon as the workspace toggle turns off', async () => {
    generateCallRecordingSummaryMock
      .mockResolvedValueOnce({ outcome: 'generated' })
      .mockResolvedValueOnce({ outcome: 'disabled' });

    const result = await generateCallRecordingSummariesForIds({
      client,
      callRecordingIds: [
        'call-recording-1',
        'call-recording-2',
        'call-recording-3',
      ],
    });

    expect(generateCallRecordingSummaryMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      generatedCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: [],
      erroredCallRecordingIds: [],
      skippedCallRecordingIds: [],
      unavailableCallRecordingIds: [],
    });
  });
});
