import { beforeEach, describe, expect, it, vi } from 'vitest';

import { summarizeCallRecordingHandler } from 'src/logic-functions/summarize-call-recording';

const generateCallRecordingSummaryMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock('src/logic-functions/flows/generate-call-recording-summary.util', () => ({
  generateCallRecordingSummary: generateCallRecordingSummaryMock,
}));

const buildEvent = ({
  name,
  updatedFields,
  recordId = 'call-recording-1',
}: {
  name: string;
  updatedFields: string[];
  recordId?: string;
}): any => ({
  name,
  recordId,
  properties: { updatedFields },
});

describe('summarize-call-recording logic function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateCallRecordingSummaryMock.mockResolvedValue({ outcome: 'generated' });
  });

  it('generates a summary when the transcript field changed', async () => {
    const result = await summarizeCallRecordingHandler(
      buildEvent({
        name: 'callRecording.updated',
        updatedFields: ['transcript'],
      }),
    );

    expect(generateCallRecordingSummaryMock).toHaveBeenCalledWith(
      expect.anything(),
      { callRecordingId: 'call-recording-1' },
    );
    expect(result).toEqual({
      callRecordingId: 'call-recording-1',
      outcome: 'generated',
    });
  });

  it('skips summary-only updates to avoid re-entrancy', async () => {
    const result = await summarizeCallRecordingHandler(
      buildEvent({
        name: 'callRecording.updated',
        updatedFields: ['summary'],
      }),
    );

    expect(generateCallRecordingSummaryMock).not.toHaveBeenCalled();
    expect(result).toEqual({ skipped: true, reason: 'transcript unchanged' });
  });

  it('skips non-update events', async () => {
    const result = await summarizeCallRecordingHandler(
      buildEvent({
        name: 'callRecording.created',
        updatedFields: ['transcript'],
      }),
    );

    expect(generateCallRecordingSummaryMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      skipped: true,
      reason: 'not a call recording update',
    });
  });
});
