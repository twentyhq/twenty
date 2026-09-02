import { describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { buildFathomMeetingPages } from 'src/__tests__/utils/build-fathom-meeting-pages.util';
import { MAX_FATHOM_MEETING_PAGES } from 'src/constants/fathom.constant';
import { listFathomMeetings } from 'src/logic-functions/utils/list-fathom-meetings.util';

describe('listFathomMeetings', () => {
  it('returns the meetings of every page regardless of recorder', async () => {
    const listMeetings = vi.fn(
      buildFathomMeetingPages([
        [buildFathomMeeting({ recordingId: 1 })],
        [
          buildFathomMeeting({
            recordingId: 2,
            recorderEmail: 'teammate@example.com',
          }),
        ],
      ]),
    );

    const meetings = await listFathomMeetings({
      fathomClient: { listMeetings },
      createdAfter: '2026-08-01T00:00:00.000Z',
    });

    expect(meetings.map((meeting) => meeting.recordingId)).toEqual([1, 2]);
    expect(listMeetings.mock.calls.map(([request]) => request)).toEqual([
      { createdAfter: '2026-08-01T00:00:00.000Z', includeActionItems: true },
      {
        createdAfter: '2026-08-01T00:00:00.000Z',
        cursor: '1',
        includeActionItems: true,
      },
    ]);
  });

  it('stops paging as soon as the caller is satisfied', async () => {
    const listMeetings = vi.fn(
      buildFathomMeetingPages([
        [buildFathomMeeting({ recordingId: 1 })],
        [buildFathomMeeting({ recordingId: 2 })],
      ]),
    );

    const meetings = await listFathomMeetings({
      fathomClient: { listMeetings },
      stopWhen: (listedMeetings) =>
        listedMeetings.some((meeting) => meeting.recordingId === 1),
    });

    expect(meetings.map((meeting) => meeting.recordingId)).toEqual([1]);
    expect(listMeetings).toHaveBeenCalledTimes(1);
  });

  it('gives up instead of walking an unbounded history', async () => {
    const listMeetings = vi.fn(async () => ({
      result: { items: [], limit: null, nextCursor: 'more' },
    }));

    await expect(
      listFathomMeetings({ fathomClient: { listMeetings } }),
    ).rejects.toThrow(`exceeded ${MAX_FATHOM_MEETING_PAGES} pages`);
    expect(listMeetings).toHaveBeenCalledTimes(MAX_FATHOM_MEETING_PAGES);
  });
});
