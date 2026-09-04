import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadTranscriptContent } from 'src/logic-functions/utils/download-transcript-content.util';

describe('downloadTranscriptContent', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the speaker-attributed WebVTT when the tenant allows it', async () => {
    fetchMock.mockResolvedValueOnce(new Response('WEBVTT', { status: 200 }));

    const result = await downloadTranscriptContent({
      accessToken: 'token',
      transcriptContentUrl: 'https://graph.microsoft.com/v1.0/x/content',
    });

    expect(result).toEqual({ content: 'WEBVTT', isSpeakerAttributed: true });
    expect(fetchMock.mock.calls[0][1].headers.Accept).toBe('text/vtt');
  });

  it('falls back to the unattributed format when attribution is disabled', async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { innerError: { code: 'SpeakerAttributionNotAllowed' } },
          }),
          { status: 403 },
        ),
      )
      .mockResolvedValueOnce(new Response('WEBVTT plain', { status: 200 }));

    const result = await downloadTranscriptContent({
      accessToken: 'token',
      transcriptContentUrl: 'https://graph.microsoft.com/v1.0/x/content',
    });

    expect(result).toEqual({
      content: 'WEBVTT plain',
      isSpeakerAttributed: false,
    });
    expect(fetchMock.mock.calls[1][1].headers.Accept).toBe(
      'application/vnd.microsoft.graph.transcript+text',
    );
  });

  it('rethrows any other Graph error', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { innerError: { code: 'GraphAccessToTranscriptsDisabled' } },
        }),
        { status: 403 },
      ),
    );

    await expect(
      downloadTranscriptContent({
        accessToken: 'token',
        transcriptContentUrl: 'https://graph.microsoft.com/v1.0/x/content',
      }),
    ).rejects.toThrow('GraphAccessToTranscriptsDisabled');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
