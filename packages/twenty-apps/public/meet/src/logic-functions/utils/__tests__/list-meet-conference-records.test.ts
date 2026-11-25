import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listMeetConferenceRecords } from 'src/logic-functions/utils/list-meet-conference-records.util';

const fetchMock = vi.fn<(url: string, init: object) => Promise<Response>>();

describe('listMeetConferenceRecords', () => {
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

    const conferenceRecords = await listMeetConferenceRecords({
      accessToken: 'token',
      startedAfter: new Date('2026-11-01T00:00:00.000Z'),
      startedBefore: new Date('2026-11-02T00:00:00.000Z'),
    });

    expect(conferenceRecords.map(({ name }) => name)).toEqual([
      'conferenceRecords/first',
    ]);

    const requestedUrl = new URL(
      'https://meet.googleapis.com/v2/conferenceRecords',
    );

    requestedUrl.searchParams.set(
      'filter',
      'start_time>="2026-11-01T00:00:00.000Z" AND start_time<="2026-11-02T00:00:00.000Z"',
    );
    requestedUrl.searchParams.set('pageSize', '100');

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(requestedUrl.toString(), {
      redirect: 'error',
      headers: { Authorization: 'Bearer token', Accept: 'application/json' },
    });
  });
});
