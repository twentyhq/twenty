import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type AppConnection } from 'twenty-sdk/logic-function';

import { findFirefliesConnectionForTranscript } from 'src/logic-functions/utils/find-fireflies-connection-for-transcript';

const fetchFirefliesTranscriptMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/utils/fetch-fireflies-transcript', () => ({
  fetchFirefliesTranscript: fetchFirefliesTranscriptMock,
}));

const connections = [
  {
    id: 'connection-1',
    providerName: 'fireflies',
    name: 'Sales Fireflies',
    handle: 'sales@example.com',
    visibility: 'workspace',
    userWorkspaceId: 'user-workspace-1',
    workspaceMemberId: null,
    accessToken: 'sales-access-token',
    scopes: ['meetings.read.user'],
    authFailedAt: null,
  },
  {
    id: 'connection-2',
    providerName: 'fireflies',
    name: 'Support Fireflies',
    handle: 'support@example.com',
    visibility: 'workspace',
    userWorkspaceId: 'user-workspace-2',
    workspaceMemberId: null,
    accessToken: 'support-access-token',
    scopes: ['meetings.read.user'],
    authFailedAt: null,
  },
] satisfies AppConnection[];

describe('findFirefliesConnectionForTranscript', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the first connected account that can access the transcript', async () => {
    fetchFirefliesTranscriptMock
      .mockResolvedValueOnce({ ok: false, errorMessage: 'not found' })
      .mockResolvedValueOnce({ ok: true, data: { id: 'transcript-1' } });

    const result = await findFirefliesConnectionForTranscript({
      connections,
      transcriptId: 'transcript-1',
    });

    expect(fetchFirefliesTranscriptMock).toHaveBeenNthCalledWith(1, {
      accessToken: 'sales-access-token',
      transcriptId: 'transcript-1',
    });
    expect(fetchFirefliesTranscriptMock).toHaveBeenNthCalledWith(2, {
      accessToken: 'support-access-token',
      transcriptId: 'transcript-1',
    });
    expect(result).toEqual({ success: true, connection: connections[1] });
  });

  it('probes accounts concurrently so a stalled account cannot delay the match', async () => {
    vi.useFakeTimers();
    fetchFirefliesTranscriptMock.mockImplementation(
      ({ accessToken }: { accessToken: string }) =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                accessToken === 'support-access-token'
                  ? { ok: true, data: { id: 'transcript-1' } }
                  : { ok: false, errorMessage: 'timed out' },
              ),
            accessToken === 'support-access-token' ? 10 : 30_000,
          ),
        ),
    );

    const resultPromise = findFirefliesConnectionForTranscript({
      connections,
      transcriptId: 'transcript-1',
    });

    expect(fetchFirefliesTranscriptMock).toHaveBeenCalledTimes(2);

    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toEqual({
      success: true,
      connection: connections[1],
    });

    vi.useRealTimers();
  });

  it('reports every account failure when no account can access the transcript', async () => {
    fetchFirefliesTranscriptMock
      .mockResolvedValueOnce({ ok: false, errorMessage: 'not found' })
      .mockResolvedValueOnce({ ok: false, errorMessage: 'forbidden' });

    await expect(
      findFirefliesConnectionForTranscript({
        connections,
        transcriptId: 'transcript-1',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Sales Fireflies: not found | Support Fireflies: forbidden',
    });
  });
});
