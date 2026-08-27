import { type Fathom } from 'fathom-typescript';
import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { describe, expect, it, vi } from 'vitest';

import { listAccessibleFathomMeetings } from 'src/logic-functions/utils/list-accessible-fathom-meetings.util';

const buildMeeting = (recordingId: number, recorderEmail: string): Meeting => ({
  title: `Recording ${recordingId}`,
  meetingTitle: `Meeting ${recordingId}`,
  meetingType: null,
  recordingId,
  url: `https://fathom.video/calls/${recordingId}`,
  meetingUrl: 'https://meet.example.com/customer-call',
  shareUrl: `https://fathom.video/share/${recordingId}`,
  createdAt: new Date('2026-08-20T10:00:00.000Z'),
  scheduledStartTime: new Date('2026-08-20T10:00:00.000Z'),
  scheduledEndTime: new Date('2026-08-20T10:30:00.000Z'),
  recordingStartTime: new Date('2026-08-20T10:00:00.000Z'),
  recordingEndTime: new Date('2026-08-20T10:30:00.000Z'),
  calendarInviteesDomainsType: 'one_or_more_external',
  sharedWith: 'single_team',
  transcriptLanguage: 'en',
  calendarInvitees: [],
  recordedBy: {
    name: recorderEmail,
    email: recorderEmail,
    emailDomain: recorderEmail.split('@')[1],
    team: 'Sales',
  },
});

const createMeetingPageIterator = (meetingPages: Meeting[][]) => ({
  async *[Symbol.asyncIterator]() {
    for (const [pageIndex, meetings] of meetingPages.entries()) {
      yield {
        result: {
          items: meetings,
          limit: meetings.length,
          nextCursor:
            pageIndex < meetingPages.length - 1
              ? `cursor-${pageIndex + 1}`
              : null,
        },
      };
    }
  },
});

describe('listAccessibleFathomMeetings', () => {
  it('returns accessible meetings from every page regardless of recorder', async () => {
    const meetingPages = [
      [buildMeeting(1, 'owner@example.com')],
      [buildMeeting(2, 'teammate@example.com')],
    ];
    const listMeetings = vi.fn().mockResolvedValue(
      createMeetingPageIterator(meetingPages),
    ) as Fathom['listMeetings'];

    const meetings = await listAccessibleFathomMeetings({
      fathomClient: { listMeetings },
      createdAfter: '2026-08-20T00:00:00.000Z',
    });

    expect(meetings.map((meeting) => meeting.recordingId)).toEqual([1, 2]);
    expect(meetings.map((meeting) => meeting.recordedBy.email)).toEqual([
      'owner@example.com',
      'teammate@example.com',
    ]);
  });

  it('stops fetching after the requested meeting is found', async () => {
    const listMeetings = vi.fn().mockResolvedValue(
      createMeetingPageIterator([
        [buildMeeting(1, 'owner@example.com')],
        [buildMeeting(2, 'teammate@example.com')],
      ]),
    ) as Fathom['listMeetings'];

    const meetings = await listAccessibleFathomMeetings({
      fathomClient: { listMeetings },
      stopWhen: (listedMeetings) =>
        listedMeetings.some((meeting) => meeting.recordingId === 1),
    });

    expect(meetings.map((meeting) => meeting.recordingId)).toEqual([1]);
  });
});
