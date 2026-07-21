import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { generateCallRecordingSummary } from 'src/logic-functions/flows/generate-call-recording-summary.util';

const runAgentMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
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

const seedCallRecording = (node: object) => {
  queryMock.mockResolvedValue({ callRecordings: { edges: [{ node }] } });
};

describe('generateCallRecordingSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'true');
    vi.stubEnv('CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT', '');
    seedCallRecording({
      id: 'call-recording-1',
      title: 'Weekly sync',
      transcript: TRANSCRIPT,
      summary: { markdown: null },
      createdBy: { source: 'APPLICATION', name: 'Call Recorder' },
    });
    mutationMock.mockResolvedValue({});
    runAgentMock.mockResolvedValue({
      success: true,
      error: null,
      result: { response: '## Overview\nGood call.' },
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('skips when summaries are disabled', async () => {
    vi.stubEnv('CALL_RECORDER_SUMMARY_ENABLED', 'false');

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'disabled' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('skips when there is no real transcript', async () => {
    seedCallRecording({
      id: 'call-recording-1',
      title: null,
      transcript: { status: 'PENDING' },
      summary: { markdown: null },
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'no-transcript' });
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('skips when a summary already exists', async () => {
    seedCallRecording({
      id: 'call-recording-1',
      title: null,
      transcript: TRANSCRIPT,
      summary: { markdown: '## Overview\nAlready here.' },
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'already-summarized' });
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('skips recordings another actor created when the app-created gate is on', async () => {
    seedCallRecording({
      id: 'call-recording-1',
      title: null,
      transcript: TRANSCRIPT,
      summary: { markdown: null },
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
    expect(mutationMock).toHaveBeenCalledTimes(1);
  });

  it('generates for recordings another actor created when explicitly requested', async () => {
    seedCallRecording({
      id: 'call-recording-1',
      title: null,
      transcript: TRANSCRIPT,
      summary: { markdown: null },
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

  it('appends the workspace admin instructions to the agent prompt', async () => {
    vi.stubEnv('CALL_RECORDER_ADDITIONAL_SUMMARY_PROMPT', 'Write terse notes.');

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
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecording: {
        __args: {
          id: 'call-recording-1',
          data: {
            summary: { blocknote: null, markdown: 'No summary available.' },
          },
        },
        id: true,
      },
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
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('propagates agent errors without writing a summary', async () => {
    runAgentMock.mockRejectedValue(new Error('Agent execution failed'));

    await expect(
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).rejects.toThrow('Agent execution failed');

    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('propagates summary write errors', async () => {
    mutationMock.mockRejectedValue(new Error('Summary write failed'));

    await expect(
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).rejects.toThrow('Summary write failed');

    expect(mutationMock).toHaveBeenCalledTimes(1);
  });
});
