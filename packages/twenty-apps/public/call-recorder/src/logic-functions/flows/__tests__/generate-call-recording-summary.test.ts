import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { generateCallRecordingSummary } from 'src/logic-functions/flows/generate-call-recording-summary.util';

const runAgentMock = vi.hoisted(() => vi.fn());
const findCallRecordingForSummaryMock = vi.hoisted(() => vi.fn());
const updateCallRecordingMock = vi.hoisted(() => vi.fn());
const getCallRecorderSummaryPromptMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
}));

vi.mock(
  'src/logic-functions/data/find-call-recording-for-summary.util',
  () => ({
    findCallRecordingForSummary: findCallRecordingForSummaryMock,
  }),
);

vi.mock('src/logic-functions/data/update-call-recording.util', () => ({
  updateCallRecording: updateCallRecordingMock,
}));

vi.mock(
  'src/logic-functions/utils/get-call-recorder-summary-prompt.util',
  () => ({
    getCallRecorderSummaryPrompt: getCallRecorderSummaryPromptMock,
  }),
);

const TRANSCRIPT = [
  {
    participant: { name: 'Alex' },
    words: [{ text: 'Hello' }, { text: 'team' }],
  },
];

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    mutation: vi.fn(),
    query: vi.fn(),
  },
);

describe('generateCallRecordingSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCallRecorderSummaryPromptMock.mockReturnValue(undefined);
    findCallRecordingForSummaryMock.mockResolvedValue({
      id: 'call-recording-1',
      title: 'Weekly sync',
      transcript: TRANSCRIPT,
      summaryMarkdown: undefined,
    });
    updateCallRecordingMock.mockResolvedValue(undefined);
    runAgentMock.mockResolvedValue({
      success: true,
      error: null,
      result: { response: '## Overview\nGood call.' },
    });
  });

  it('skips when summaries are disabled', async () => {
    getCallRecorderSummaryPromptMock.mockReturnValue(false);

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'disabled' });
    expect(findCallRecordingForSummaryMock).not.toHaveBeenCalled();
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('skips when there is no real transcript', async () => {
    findCallRecordingForSummaryMock.mockResolvedValue({
      id: 'call-recording-1',
      title: undefined,
      transcript: { status: 'PENDING' },
      summaryMarkdown: undefined,
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'no-transcript' });
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('skips when a summary already exists', async () => {
    findCallRecordingForSummaryMock.mockResolvedValue({
      id: 'call-recording-1',
      title: undefined,
      transcript: TRANSCRIPT,
      summaryMarkdown: '## Overview\nAlready here.',
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'already-summarized' });
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('runs the agent and stores the summary markdown on the happy path', async () => {
    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'generated' });
    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining('Alex: Hello team'),
      }),
    );
    expect(updateCallRecordingMock).toHaveBeenCalledWith(CLIENT, {
      id: 'call-recording-1',
      data: {
        summary: { blocknote: null, markdown: '## Overview\nGood call.' },
      },
    });
  });

  it('passes a custom summary prompt to the agent', async () => {
    getCallRecorderSummaryPromptMock.mockReturnValue('Write terse notes.');

    await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining(
          'Write terse notes.\n\nMeeting title: Weekly sync',
        ),
      }),
    );
  });

  it('stores the no-summary verdict verbatim so the run is terminal', async () => {
    runAgentMock.mockResolvedValue({
      success: true,
      error: null,
      result: { response: 'No summary available.' },
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'generated' });
    expect(updateCallRecordingMock).toHaveBeenCalledWith(CLIENT, {
      id: 'call-recording-1',
      data: { summary: { blocknote: null, markdown: 'No summary available.' } },
    });
  });

  it('throws without writing a summary when the agent run fails', async () => {
    runAgentMock.mockResolvedValue({
      success: false,
      error: 'no more available credits',
      result: null,
    });

    await expect(
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).rejects.toThrow(
      'Call recording summarizer agent run failed: no more available credits',
    );

    expect(updateCallRecordingMock).not.toHaveBeenCalled();
  });

  it('returns empty-summary when the agent succeeds with a blank response', async () => {
    runAgentMock.mockResolvedValue({
      success: true,
      error: null,
      result: { response: '   ' },
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'empty-summary' });
    expect(updateCallRecordingMock).not.toHaveBeenCalled();
  });

  it('propagates agent errors without writing a summary', async () => {
    runAgentMock.mockRejectedValue(new Error('Agent execution failed'));

    await expect(
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).rejects.toThrow('Agent execution failed');

    expect(updateCallRecordingMock).not.toHaveBeenCalled();
  });

  it('propagates summary write errors', async () => {
    updateCallRecordingMock.mockRejectedValue(
      new Error('Summary write failed'),
    );

    await expect(
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).rejects.toThrow('Summary write failed');

    expect(updateCallRecordingMock).toHaveBeenCalledTimes(1);
  });
});
