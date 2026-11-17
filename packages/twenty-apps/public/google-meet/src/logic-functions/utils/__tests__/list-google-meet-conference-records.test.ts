import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listGoogleMeetConferenceRecords } from 'src/logic-functions/utils/list-google-meet-conference-records.util';

const fetchMock = vi.fn<(url: string) => Promise<Response>>();

describe('listGoogleMeetConferenceRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should list the conferences started in the window', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          conferenceRecords: [
            {
              name: 'conferenceRecords/first',
              startTime: '2026-11-01T09:00:00Z',
            },
          ],
        }),
      ),
    );

    const conferenceRecords = await listGoogleMeetConferenceRecords({
      accessToken: 'token',
      startedAfter: new Date('2026-11-01T00:00:00.000Z'),
      startedBefore: new Date('2026-11-02T00:00:00.000Z'),
    });

    expect(conferenceRecords.map(({ name }) => name)).toEqual([
      'conferenceRecords/first',
    ]);

    const requestedUrl = new URL(fetchMock.mock.calls[0][0]);

    expect(requestedUrl.pathname).toBe('/v2/conferenceRecords');
    expect(requestedUrl.searchParams.get('filter')).toBe(
      'start_time>="2026-11-01T00:00:00.000Z" AND start_time<="2026-11-02T00:00:00.000Z"',
    );
  });
});
