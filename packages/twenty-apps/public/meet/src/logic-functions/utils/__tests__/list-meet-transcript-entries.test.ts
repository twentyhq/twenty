import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listMeetTranscriptEntries } from 'src/logic-functions/utils/list-meet-transcript-entries.util';

const fetchMock = vi.fn<(url: string, init: object) => Promise<Response>>();

describe('listMeetTranscriptEntries', () => {
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
      listMeetTranscriptEntries({
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
