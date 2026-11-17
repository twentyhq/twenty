import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MAX_GOOGLE_MEET_LIST_PAGES } from 'src/logic-functions/constants/google-meet-api.constant';
import { listGoogleMeetCollection } from 'src/logic-functions/utils/list-google-meet-collection.util';

const fetchMock = vi.fn<(url: string, init: object) => Promise<Response>>();

const buildPageResponse = (page: {
  transcripts?: { name: string }[];
  nextPageToken?: string;
}) => new Response(JSON.stringify(page));

const listTranscripts = () =>
  listGoogleMeetCollection<'transcripts', { name: string }>({
    accessToken: 'token',
    path: 'conferenceRecords/first/transcripts',
    collectionKey: 'transcripts',
  });

const getRequestedQueryParameters = () =>
  fetchMock.mock.calls.map(([url]) =>
    Object.fromEntries(new URL(url).searchParams),
  );

describe('listGoogleMeetCollection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should collect the items of every page', async () => {
    fetchMock
      .mockResolvedValueOnce(
        buildPageResponse({
          transcripts: [{ name: 'first' }],
          nextPageToken: 'next-page',
        }),
      )
      .mockResolvedValueOnce(
        buildPageResponse({ transcripts: [{ name: 'second' }] }),
      );

    await expect(listTranscripts()).resolves.toEqual([
      { name: 'first' },
      { name: 'second' },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getRequestedQueryParameters()).toEqual([
      { pageSize: '100' },
      { pageSize: '100', pageToken: 'next-page' },
    ]);
  });

  it('should return no item when Google lists none', async () => {
    fetchMock.mockResolvedValue(buildPageResponse({}));

    await expect(listTranscripts()).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://meet.googleapis.com/v2/conferenceRecords/first/transcripts?pageSize=100',
      {
        redirect: 'error',
        headers: { Authorization: 'Bearer token', Accept: 'application/json' },
      },
    );
  });

  it('should stop when Google keeps returning more pages than the limit', async () => {
    fetchMock.mockImplementation(async () =>
      buildPageResponse({ nextPageToken: 'next-page' }),
    );

    await expect(listTranscripts()).rejects.toMatchObject({
      code: 'PAGINATION_LIMIT_EXCEEDED',
    });
    expect(fetchMock).toHaveBeenCalledTimes(MAX_GOOGLE_MEET_LIST_PAGES);
  });
});
