import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { generateCallRecordingSummary } from 'src/logic-functions/flows/generate-call-recording-summary.util';

const runAgentMock = vi.hoisted(() => vi.fn());
const findCallRecordingForSummaryMock = vi.hoisted(() => vi.fn());
const updateCallRecordingMock = vi.hoisted(() => vi.fn());
const getCallRecorderAdditionalSummaryPromptMock = vi.hoisted(() => vi.fn());
const isCallRecordingSummaryEnabledMock = vi.hoisted(() => vi.fn());

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
  'src/logic-functions/utils/get-call-recorder-additional-summary-prompt.util',
  () => ({
    getCallRecorderAdditionalSummaryPrompt:
      getCallRecorderAdditionalSummaryPromptMock,
  }),
);

vi.mock(
  'src/logic-functions/utils/is-call-recording-summary-enabled.util',
  () => ({
    isCallRecordingSummaryEnabled: isCallRecordingSummaryEnabledMock,
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
    getCallRecorderAdditionalSummaryPromptMock.mockReturnValue(undefined);
    isCallRecordingSummaryEnabledMock.mockReturnValue(true);
    findCallRecordingForSummaryMock.mockResolvedValue({
      id: 'call-recording-1',
      title: 'Weekly sync',
      transcript: TRANSCRIPT,
      summaryMarkdown: undefined,
      createdBy: { source: 'APPLICATION', name: 'Call Recorder' },
    });
    updateCallRecordingMock.mockResolvedValue(undefined);
    runAgentMock.mockResolvedValue({
      success: true,
      error: null,
      result: { response: '## Overview\nGood call.' },
    });
  });

  it('skips when summaries are disabled', async () => {
    isCallRecordingSummaryEnabledMock.mockReturnValue(false);

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

  it('skips recordings another actor created when the app-created gate is on', async () => {
    findCallRecordingForSummaryMock.mockResolvedValue({
      id: 'call-recording-1',
      title: undefined,
      transcript: TRANSCRIPT,
      summaryMarkdown: undefined,
      createdBy: { source: 'MANUAL', name: 'Alex' },
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
      requireCreatedByCallRecorder: true,
    });

    expect(result).toEqual({ outcome: 'not-app-recording' });
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('generates for app-created recordings when the app-created gate is on', async () => {
    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
      requireCreatedByCallRecorder: true,
    });

    expect(result).toEqual({ outcome: 'generated' });
    expect(runAgentMock).toHaveBeenCalledTimes(1);
    expect(updateCallRecordingMock).toHaveBeenCalledTimes(1);
  });

  it('generates for recordings another actor created when explicitly requested', async () => {
    findCallRecordingForSummaryMock.mockResolvedValue({
      id: 'call-recording-1',
      title: undefined,
      transcript: TRANSCRIPT,
      summaryMarkdown: undefined,
      createdBy: { source: 'MANUAL', name: 'Alex' },
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'generated' });
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

  it('appends the workspace admin instructions to the agent prompt', async () => {
    getCallRecorderAdditionalSummaryPromptMock.mockReturnValue(
      'Write terse notes.',
    );

    await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining(
          'Additional instructions from the workspace admin:\nWrite terse notes.\n\nMeeting title: Weekly sync',
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

  it('stores nothing when the agent run fails', async () => {
    runAgentMock.mockResolvedValue({
      success: false,
      error: 'no more available credits',
      result: null,
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
