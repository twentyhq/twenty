import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listGoogleMeetTranscriptEntries } from 'src/logic-functions/utils/list-google-meet-transcript-entries.util';

const fetchMock = vi.fn<(url: string, init: object) => Promise<Response>>();

describe('listGoogleMeetTranscriptEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should list the entries of the transcript', async () => {
    const transcriptEntry = {
      name: 'conferenceRecords/first/transcripts/second/entries/third',
      participant: 'conferenceRecords/first/participants/fourth',
      text: 'Hello.',
    };

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ transcriptEntries: [transcriptEntry] })),
    );

    await expect(
      listGoogleMeetTranscriptEntries({
        accessToken: 'token',
        transcriptName: 'conferenceRecords/first/transcripts/second',
      }),
    ).resolves.toEqual([transcriptEntry]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://meet.googleapis.com/v2/conferenceRecords/first/transcripts/second/entries?pageSize=100',
      {
        redirect: 'error',
        headers: { Authorization: 'Bearer token', Accept: 'application/json' },
      },
    );
  });
});
