import { describe, expect, it, vi } from 'vitest';

import { buildFathomMeeting } from 'src/__tests__/utils/build-fathom-meeting.util';
import { buildFathomMeetingPages } from 'src/__tests__/utils/build-fathom-meeting-pages.util';
import { MAX_FATHOM_MEETING_PAGES } from 'src/constants/fathom.constant';
import { listFathomMeetings } from 'src/logic-functions/utils/list-fathom-meetings.util';

describe('listFathomMeetings', () => {
  it('stops paging as soon as the caller is satisfied', async () => {
    const listMeetings = vi.fn(
      buildFathomMeetingPages([
        [buildFathomMeeting({ recordingId: 1 })],
        [buildFathomMeeting({ recordingId: 2 })],
      ]),
    );

    const { meetings, isTruncated } = await listFathomMeetings({
      fathomClient: { listMeetings },
      stopWhen: (listedMeetings) =>
        listedMeetings.some((meeting) => meeting.recordingId === 1),
    });

    expect(meetings.map((meeting) => meeting.recordingId)).toEqual([1]);
    expect(isTruncated).toBe(false);
    expect(listMeetings).toHaveBeenCalledTimes(1);
  });

  it('is not truncated when the history ends exactly at the page cap', async () => {
    const meetingPages = Array.from(
      { length: MAX_FATHOM_MEETING_PAGES },
      (_, pageIndex) => [buildFathomMeeting({ recordingId: pageIndex })],
    );

    const { meetings, isTruncated } = await listFathomMeetings({
      fathomClient: { listMeetings: buildFathomMeetingPages(meetingPages) },
    });

    expect(meetings).toHaveLength(MAX_FATHOM_MEETING_PAGES);
    expect(isTruncated).toBe(false);
  });

  it('returns what it listed as truncated instead of walking an unbounded history', async () => {
    const meetingPages = Array.from(
      { length: MAX_FATHOM_MEETING_PAGES + 1 },
      (_, pageIndex) => [buildFathomMeeting({ recordingId: pageIndex })],
    );
    const listMeetings = vi.fn(buildFathomMeetingPages(meetingPages));

    const { meetings, isTruncated } = await listFathomMeetings({
      fathomClient: { listMeetings },
    });

    expect(meetings).toHaveLength(MAX_FATHOM_MEETING_PAGES);
    expect(isTruncated).toBe(true);
    expect(listMeetings).toHaveBeenCalledTimes(MAX_FATHOM_MEETING_PAGES);
  });
});
