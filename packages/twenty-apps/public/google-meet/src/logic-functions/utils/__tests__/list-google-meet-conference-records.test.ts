import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MAX_GOOGLE_MEET_CONFERENCE_RECORD_PAGES } from 'src/logic-functions/constants/google-meet-api.constant';
import { type GoogleMeetConferenceRecordPage } from 'src/logic-functions/types/google-meet-conference-record-page.type';
import { listGoogleMeetConferenceRecords } from 'src/logic-functions/utils/list-google-meet-conference-records.util';

const fetchMock = vi.fn<(url: string) => Promise<Response>>();

const buildPageResponse = (page: GoogleMeetConferenceRecordPage) =>
  new Response(JSON.stringify(page));

const listConferenceRecords = () =>
  listGoogleMeetConferenceRecords({
    accessToken: 'token',
    startedAfter: new Date('2026-11-01T00:00:00.000Z'),
    startedBefore: new Date('2026-11-02T00:00:00.000Z'),
  });

const getRequestedQueryParameters = () =>
  fetchMock.mock.calls.map(([url]) =>
    Object.fromEntries(new URL(url).searchParams),
  );

describe('listGoogleMeetConferenceRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should list the conferences started in the window across pages', async () => {
    fetchMock
      .mockResolvedValueOnce(
        buildPageResponse({
          conferenceRecords: [
            {
              name: 'conferenceRecords/first',
              startTime: '2026-11-01T09:00:00Z',
            },
          ],
          nextPageToken: 'next-page',
        }),
      )
      .mockResolvedValueOnce(
        buildPageResponse({
          conferenceRecords: [
            {
              name: 'conferenceRecords/second',
              startTime: '2026-11-01T15:00:00Z',
            },
          ],
        }),
      );

    const conferenceRecords = await listConferenceRecords();

    expect(conferenceRecords.map(({ name }) => name)).toEqual([
      'conferenceRecords/first',
      'conferenceRecords/second',
    ]);

    const filter =
      'start_time>="2026-11-01T00:00:00.000Z" AND start_time<="2026-11-02T00:00:00.000Z"';

    expect(getRequestedQueryParameters()).toEqual([
      { filter, pageSize: '100' },
      { filter, pageSize: '100', pageToken: 'next-page' },
    ]);
  });

  it('should return no conference when Google lists none', async () => {
    fetchMock.mockResolvedValue(buildPageResponse({}));

    await expect(listConferenceRecords()).resolves.toEqual([]);
  });

  it('should stop when Google keeps returning more pages than the limit', async () => {
    fetchMock.mockImplementation(async () =>
      buildPageResponse({ nextPageToken: 'next-page' }),
    );

    await expect(listConferenceRecords()).rejects.toThrow(
      'Google Meet conference pagination exceeded its limit',
    );
    expect(fetchMock).toHaveBeenCalledTimes(
      MAX_GOOGLE_MEET_CONFERENCE_RECORD_PAGES,
    );
  });
});
