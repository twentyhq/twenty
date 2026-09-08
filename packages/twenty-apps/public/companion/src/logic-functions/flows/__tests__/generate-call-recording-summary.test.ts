import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { generateCallRecordingSummary } from 'src/logic-functions/flows/generate-call-recording-summary.util';

const runAgentMock = vi.hoisted(() => vi.fn());
const stored = vi.hoisted(() => new Map<string, unknown>());
const saveCache = vi.hoisted(() => vi.fn());
vi.mock('src/logic-functions/data/claim-summary-generation.util', () => ({
  claimSummaryGeneration: async (key: string) => {
    if (stored.has(key)) return false;
    stored.set(key, { status: 'RUNNING', startedAt: new Date().toISOString() });
    return true;
  },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  runAgent: runAgentMock,
  kv: { get: async (key: string) => stored.get(key) ?? null, set: saveCache },
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
  queryMock.mockResolvedValue({
    callRecordings: {
      edges: [
        {
          node: {
            companionSession: {
              source: 'desktop',
              media: 'audio',
              userWorkspaceId: 'owner',
            },
            ...node,
          },
        },
      ],
    },
  });
};

describe('generateCallRecordingSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stored.clear();
    saveCache.mockImplementation(async (key: string, value: unknown) => {
      stored.set(key, value);
    });
    vi.stubEnv('COMPANION_SUMMARY_ENABLED', 'true');
    vi.stubEnv('COMPANION_ADDITIONAL_SUMMARY_PROMPT', '');
    seedCallRecording({
      id: 'call-recording-1',
      title: 'Weekly sync',
      transcript: TRANSCRIPT,
      summary: { markdown: null },
      createdBy: { source: 'APPLICATION', name: 'Desktop Recorder' },
    });
    mutationMock.mockResolvedValue({
      updateCallRecordings: [{ id: 'call-recording-1' }],
    });
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
    vi.stubEnv('COMPANION_SUMMARY_ENABLED', 'false');

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

  it('regenerates an existing summary when explicitly requested', async () => {
    seedCallRecording({
      id: 'call-recording-1',
      title: null,
      transcript: TRANSCRIPT,
      summary: { markdown: '## Overview\nOld summary.' },
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
      shouldRegenerateExistingSummary: true,
    });

    expect(result).toEqual({ outcome: 'generated' });
    expect(runAgentMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledTimes(1);
  });

  it('skips recordings without Companion ownership', async () => {
    seedCallRecording({
      id: 'call-recording-1',
      companionSession: null,
      title: null,
      transcript: TRANSCRIPT,
      summary: { markdown: null },
      createdBy: { source: 'MANUAL', name: 'Alex' },
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'not-app-recording' });
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('generates for Companion-owned recordings', async () => {
    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'generated' });
    expect(runAgentMock).toHaveBeenCalledTimes(1);
    expect(mutationMock).toHaveBeenCalledTimes(1);
  });

  it('automatically summarizes desktop captures attributed to the signed-in user', async () => {
    seedCallRecording({
      id: 'call-recording-1',
      transcript: TRANSCRIPT,
      createdBy: { source: 'MANUAL', name: 'Alex' },
      companionSession: {
        source: 'desktop',
        media: 'audio',
        userWorkspaceId: 'user-workspace-1',
        sdkUploadId: 'sdk-upload-1',
      },
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'generated' });
    expect(runAgentMock).toHaveBeenCalledOnce();
    expect(mutationMock).toHaveBeenCalledOnce();
  });

  it('retries a failed record save from the durable result without paying for another agent run', async () => {
    mutationMock.mockRejectedValueOnce(new Error('Write timed out'));
    await expect(
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).rejects.toThrow('Write timed out');
    expect(
      stored.get('companion-summary:call-recording-1:automatic'),
    ).toMatchObject({ status: 'READY' });
    expect(
      await generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).toEqual({ outcome: 'generated' });
    expect(runAgentMock).toHaveBeenCalledTimes(1);
  });

  it('runs one paid generation when two deliveries both read an empty summary', async () => {
    const results = await Promise.all([
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ]);
    expect(runAgentMock).toHaveBeenCalledTimes(1);
    expect(results).toContainEqual({ outcome: 'generated' });
  });

  it('reports an interrupted request without automatically charging again', async () => {
    stored.set('companion-summary:call-recording-1:automatic', {
      status: 'RUNNING',
      startedAt: new Date(Date.now() - 16 * 60_000).toISOString(),
    });
    expect(
      await generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).toEqual({ outcome: 'interrupted' });
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('preserves a summary changed while generation was running', async () => {
    mutationMock.mockResolvedValueOnce({ updateCallRecordings: [] });
    expect(
      await generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).toEqual({ outcome: 'already-summarized' });
    expect(
      stored.get('companion-summary:call-recording-1:automatic'),
    ).toMatchObject({ status: 'READY' });
  });

  it('reports persistent storage failure without repeating a paid generation', async () => {
    saveCache
      .mockRejectedValueOnce(new Error('Database unavailable'))
      .mockRejectedValueOnce(new Error('Database unavailable'))
      .mockRejectedValueOnce(new Error('Database unavailable'))
      .mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(
      generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).rejects.toThrow('Database unavailable');
    await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });
    expect(runAgentMock).toHaveBeenCalledTimes(1);
  });

  it('retries persisting the paid output after a temporary key-value write failure', async () => {
    saveCache.mockRejectedValueOnce(new Error('temporary storage failure'));
    expect(
      await generateCallRecordingSummary(CLIENT, {
        callRecordingId: 'call-recording-1',
      }),
    ).toEqual({ outcome: 'generated' });
    expect(runAgentMock).toHaveBeenCalledTimes(1);
    expect(saveCache).toHaveBeenCalledTimes(2);
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
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: 'call-recording-1' },
            or: [
              { summary: { markdown: { is: 'NULL' } } },
              { summary: { markdown: { eq: '' } } },
            ],
          },
          data: {
            summary: { blocknote: null, markdown: '## Overview\nGood call.' },
          },
        },
        id: true,
      },
    });
  });

  it('appends the workspace admin instructions to the agent prompt', async () => {
    vi.stubEnv('COMPANION_ADDITIONAL_SUMMARY_PROMPT', 'Write terse notes.');

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

  it('stores a grounded unavailable placeholder so the run is terminal', async () => {
    runAgentMock.mockResolvedValue({
      success: true,
      error: null,
      result: {
        response:
          'SUMMARY_UNAVAILABLE: The transcript contains only greetings and audio checks.',
      },
    });

    const result = await generateCallRecordingSummary(CLIENT, {
      callRecordingId: 'call-recording-1',
    });

    expect(result).toEqual({ outcome: 'not-summarizable' });
    expect(mutationMock).toHaveBeenCalledWith({
      updateCallRecordings: {
        __args: {
          filter: {
            id: { eq: 'call-recording-1' },
            or: [
              { summary: { markdown: { is: 'NULL' } } },
              { summary: { markdown: { eq: '' } } },
            ],
          },
          data: {
            summary: {
              blocknote: null,
              markdown:
                '## Summary unavailable\n\nThe transcript contains only greetings and audio checks.',
            },
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
});
