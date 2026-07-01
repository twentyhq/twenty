import { beforeEach, describe, expect, it, vi } from 'vitest';

import { generateCallRecordingSummary } from 'src/logic-functions/flows/generate-call-recording-summary.util';

const runAgentMock = vi.hoisted(() => vi.fn());
const findCallRecordingForSummaryMock = vi.hoisted(() => vi.fn());
const claimCallRecordingSummaryMock = vi.hoisted(() => vi.fn());
const updateCallRecordingMock = vi.hoisted(() => vi.fn());
const getCallRecorderSummaryPromptMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
}));

vi.mock('src/logic-functions/data/find-call-recording-for-summary.util', () => ({
  findCallRecordingForSummary: findCallRecordingForSummaryMock,
}));

vi.mock('src/logic-functions/data/claim-call-recording-summary.util', () => ({
  claimCallRecordingSummary: claimCallRecordingSummaryMock,
}));

vi.mock('src/logic-functions/data/update-call-recording.util', () => ({
  updateCallRecording: updateCallRecordingMock,
}));

vi.mock('src/logic-functions/utils/get-call-recorder-summary-prompt.util', () => ({
  getCallRecorderSummaryPrompt: getCallRecorderSummaryPromptMock,
}));

const TRANSCRIPT = [
  { participant: { name: 'Alex' }, words: [{ text: 'Hello' }, { text: 'team' }] },
];

const CLIENT = {} as never;

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
    claimCallRecordingSummaryMock.mockResolvedValue(true);
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
    expect(claimCallRecordingSummaryMock).not.toHaveBeenCalled();
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
    expect(claimCallRecordingSummaryMock).not.toHaveBeenCalled();
  });

  it('skips when a summary already exists, without claiming', async () => {
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
    expect(claimCallRecordingSummaryMock).not.toHaveBeenCalled();
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('does not run the agent when the claim is lost', async () => {
    claimCallRecordingSummaryMock.mockResolvedValue(false);

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'not-claimed' });
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
      data: { summary: { markdown: '## Overview\nGood call.' } },
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

  it('releases the claim when the agent yields no usable summary', async () => {
    runAgentMock.mockResolvedValue({
      success: false,
      error: 'no more available credits',
      result: null,
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'empty-summary' });
    expect(updateCallRecordingMock).toHaveBeenCalledWith(CLIENT, {
      id: 'call-recording-1',
      data: { summary: null },
    });
  });

  it('releases the claim and rethrows when the agent call fails', async () => {
    runAgentMock.mockRejectedValue(new Error('Agent execution failed'));

    await expect(
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).rejects.toThrow('Agent execution failed');

    expect(updateCallRecordingMock).toHaveBeenCalledWith(CLIENT, {
      id: 'call-recording-1',
      data: { summary: null },
    });
  });

  it('releases the claim and rethrows when storing the summary fails', async () => {
    updateCallRecordingMock
      .mockRejectedValueOnce(new Error('Summary write failed'))
      .mockResolvedValueOnce(undefined);

    await expect(
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).rejects.toThrow('Summary write failed');

    expect(updateCallRecordingMock).toHaveBeenNthCalledWith(1, CLIENT, {
      id: 'call-recording-1',
      data: { summary: { markdown: '## Overview\nGood call.' } },
    });
    expect(updateCallRecordingMock).toHaveBeenNthCalledWith(2, CLIENT, {
      id: 'call-recording-1',
      data: { summary: null },
    });
  });
});
