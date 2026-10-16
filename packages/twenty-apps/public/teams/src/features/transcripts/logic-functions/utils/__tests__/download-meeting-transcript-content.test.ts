import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadMeetingTranscriptContent } from 'src/features/transcripts/logic-functions/utils/download-meeting-transcript-content';

const ATTRIBUTED_CONTENT =
  'WEBVTT\n\n00:00:01.000 --> 00:00:03.000\n<v Alice Martin>Hello.</v>\n';

const UNATTRIBUTED_CONTENT =
  'WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello.\n';

const fetchMock =
  vi.fn<
    (
      url: string,
      init: { headers: Record<string, string> },
    ) => Promise<Response>
  >();

const buildGraphErrorResponse = (status: number, innerErrorCode: string) =>
  new Response(
    JSON.stringify({
      error: { message: 'Denied', innerError: { code: innerErrorCode } },
    }),
    { status },
  );

const getRequestedFormats = () =>
  fetchMock.mock.calls.map(([, init]) => init.headers.Accept);

const download = () =>
  downloadMeetingTranscriptContent({
    accessToken: 'token',
    meetingId: 'meeting-1',
    transcriptId: 'transcript-1',
  });

describe('downloadMeetingTranscriptContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should download the transcript with its speakers', async () => {
    fetchMock.mockResolvedValue(new Response(ATTRIBUTED_CONTENT));

    await expect(download()).resolves.toEqual({
      content: ATTRIBUTED_CONTENT,
      isSpeakerAttributed: true,
    });
    expect(getRequestedFormats()).toEqual(['text/vtt']);
  });

  it('should fall back to the transcript without speakers when the tenant does not allow speaker attribution', async () => {
    fetchMock
      .mockResolvedValueOnce(
        buildGraphErrorResponse(403, 'SpeakerAttributionNotAllowed'),
      )
      .mockResolvedValueOnce(new Response(UNATTRIBUTED_CONTENT));

    await expect(download()).resolves.toEqual({
      content: UNATTRIBUTED_CONTENT,
      isSpeakerAttributed: false,
    });
    expect(getRequestedFormats()).toEqual([
      'text/vtt',
      'application/vnd.microsoft.graph.transcript+text',
    ]);
  });

  it('should not fall back when Microsoft refuses the transcript for another reason', async () => {
    fetchMock.mockResolvedValue(
      buildGraphErrorResponse(403, 'GraphAccessToTranscriptsDisabled'),
    );

    await expect(download()).rejects.toThrow(
      'GraphAccessToTranscriptsDisabled',
    );
    expect(getRequestedFormats()).toEqual(['text/vtt']);
  });
});
