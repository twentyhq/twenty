import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadTranscript } from 'src/logic-functions/flows/download-transcript.util';

const TRANSCRIPT_DOWNLOAD_URL =
  'https://recall-transcripts.example.com/transcript-1';
const RECALL_TRANSCRIPT_URL =
  'https://us-west-2.recall.ai/api/v1/transcript/recall-transcript-1/';

const buildRecallTranscriptResponse = () =>
  new Response(
    JSON.stringify({
      data: { download_url: TRANSCRIPT_DOWNLOAD_URL },
      status: { code: 'done' },
    }),
    { status: 200 },
  );

describe('downloadTranscript', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RECALL_API_KEY', 'recall-api-key');
    vi.stubEnv('RECALL_REGION', 'us-west-2');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('downloads transcript content with a timeout', async () => {
    const transcriptContent = [{ participant: { id: 1 }, words: [] }];

    fetchMock.mockImplementation((url: string) => {
      if (url === RECALL_TRANSCRIPT_URL) {
        return Promise.resolve(buildRecallTranscriptResponse());
      }

      if (url === TRANSCRIPT_DOWNLOAD_URL) {
        return Promise.resolve(
          new Response(JSON.stringify(transcriptContent), { status: 200 }),
        );
      }

      throw new Error(`Unhandled fetch url in test: ${url}`);
    });

    const result = await downloadTranscript({
      transcriptId: 'recall-transcript-1',
    });

    expect(result).toEqual({ outcome: 'filled', content: transcriptContent });
    expect(fetchMock).toHaveBeenCalledWith(
      RECALL_TRANSCRIPT_URL,
      expect.objectContaining({
        method: 'GET',
        headers: { Authorization: 'Token recall-api-key' },
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      TRANSCRIPT_DOWNLOAD_URL,
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('logs raw download failures but returns a generic error', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url === RECALL_TRANSCRIPT_URL) {
        return Promise.resolve(buildRecallTranscriptResponse());
      }

      if (url === TRANSCRIPT_DOWNLOAD_URL) {
        return Promise.reject(new Error('socket leaked detail'));
      }

      throw new Error(`Unhandled fetch url in test: ${url}`);
    });

    await expect(
      downloadTranscript({ transcriptId: 'recall-transcript-1' }),
    ).resolves.toEqual({
      outcome: 'error',
      errorMessage: 'transcript download failed',
    });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('socket leaked detail'),
    );
  });
  it.each([{}, 'not a transcript', [null], [{ words: ['invalid'] }]])(
    'rejects malformed transcript content (%j)',
    async (content) => {
      fetchMock
        .mockResolvedValueOnce(buildRecallTranscriptResponse())
        .mockResolvedValueOnce(
          new Response(JSON.stringify(content), { status: 200 }),
        );
      expect(
        await downloadTranscript({ transcriptId: 'recall-transcript-1' }),
      ).toMatchObject({ outcome: 'error' });
    },
  );

  it('recognizes deletion even if the provider still returns an old download URL', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { download_url: TRANSCRIPT_DOWNLOAD_URL },
          status: { code: 'deleted' },
        }),
        { status: 200 },
      ),
    );
    expect(
      await downloadTranscript({ transcriptId: 'recall-transcript-1' }),
    ).toEqual({ outcome: 'deleted' });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
