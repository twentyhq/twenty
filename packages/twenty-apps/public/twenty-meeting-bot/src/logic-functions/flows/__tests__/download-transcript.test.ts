import { beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadTranscript } from 'src/logic-functions/flows/download-transcript.util';

const retrieveRecallTranscriptMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/recall-api/retrieve-recall-transcript.util',
  () => ({
    retrieveRecallTranscript: retrieveRecallTranscriptMock,
  }),
);

describe('downloadTranscript', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    retrieveRecallTranscriptMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('downloads transcript content with a timeout', async () => {
    const transcriptContent = [{ participant: { id: 1 }, words: [] }];

    retrieveRecallTranscriptMock.mockResolvedValue({
      ok: true,
      transcript: {
        downloadUrl: 'https://recall-transcripts.example.com/transcript-1',
        statusCode: 'done',
        statusSubCode: undefined,
      },
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => transcriptContent,
    });

    const result = await downloadTranscript({
      transcriptId: 'recall-transcript-1',
    });

    expect(result).toEqual({ outcome: 'filled', content: transcriptContent });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://recall-transcripts.example.com/transcript-1',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('logs raw download failures but returns a generic error', async () => {
    retrieveRecallTranscriptMock.mockResolvedValue({
      ok: true,
      transcript: {
        downloadUrl: 'https://recall-transcripts.example.com/transcript-1',
        statusCode: 'done',
        statusSubCode: undefined,
      },
    });
    fetchMock.mockRejectedValue(new Error('socket leaked detail'));

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
});
