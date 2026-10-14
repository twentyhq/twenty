import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { listTeamsOccurrenceTranscripts } from 'src/features/transcripts/logic-functions/utils/list-teams-occurrence-transcripts';

const { getMeetingByJoinUrlMock, listMeetingTranscriptsMock } = vi.hoisted(
  () => ({
    getMeetingByJoinUrlMock: vi.fn(),
    listMeetingTranscriptsMock: vi.fn(),
  }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/get-meeting-by-join-url',
  () => ({ getMeetingByJoinUrl: getMeetingByJoinUrlMock }),
);

vi.mock(
  'src/features/transcripts/logic-functions/utils/list-meeting-transcripts',
  () => ({ listMeetingTranscripts: listMeetingTranscriptsMock }),
);

const buildOccurrence = (joinWebUrl: string, startDateTime: string) => ({
  joinWebUrl,
  startDateTime,
  endDateTime: new Date(Date.parse(startDateTime) + 30 * 60_000).toISOString(),
  calendarReference: { eventExternalId: `event-${startDateTime}` },
});

const WEEKLY_SYNC_OCCURRENCES = [
  buildOccurrence('weekly-sync', '2026-09-01T10:00:00.000Z'),
  buildOccurrence('weekly-sync', '2026-09-08T10:00:00.000Z'),
];

describe('listTeamsOccurrenceTranscripts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMeetingByJoinUrlMock.mockImplementation(async ({ joinWebUrl }) => ({
      id: `meeting-${joinWebUrl}`,
    }));
  });

  it('should list the transcripts recorded during the listed occurrences of each meeting', async () => {
    listMeetingTranscriptsMock.mockResolvedValue([
      { id: 'first-week', createdDateTime: '2026-09-01T10:05:00Z' },
      { id: 'second-week', createdDateTime: '2026-09-08T10:05:00Z' },
      { id: 'other-week', createdDateTime: '2026-09-15T10:05:00Z' },
    ]);

    const { transcripts } = await listTeamsOccurrenceTranscripts({
      accessToken: 'token',
      occurrences: WEEKLY_SYNC_OCCURRENCES,
    });

    expect(
      transcripts.map(({ transcript, calendarReference }) => [
        transcript.id,
        calendarReference?.eventExternalId,
      ]),
    ).toEqual([
      ['first-week', 'event-2026-09-01T10:00:00.000Z'],
      ['second-week', 'event-2026-09-08T10:00:00.000Z'],
    ]);
    expect(getMeetingByJoinUrlMock).toHaveBeenCalledTimes(1);
  });

  it('should skip a meeting whose transcripts Microsoft Graph cannot list', async () => {
    listMeetingTranscriptsMock.mockImplementation(async ({ meetingId }) => {
      if (meetingId === 'meeting-weekly-sync') {
        throw new GraphRequestError({
          message: 'Microsoft Graph request failed (403)',
          status: 403,
          innerErrorCode: undefined,
        });
      }

      return [{ id: 'standup', createdDateTime: '2026-09-02T09:05:00Z' }];
    });

    const { transcripts, unavailableMeetingCount } =
      await listTeamsOccurrenceTranscripts({
        accessToken: 'token',
        occurrences: [
          ...WEEKLY_SYNC_OCCURRENCES,
          buildOccurrence('standup', '2026-09-02T09:00:00.000Z'),
        ],
      });

    expect(transcripts.map(({ transcript }) => transcript.id)).toEqual([
      'standup',
    ]);
    expect(unavailableMeetingCount).toBe(1);
  });

  it('should fail when Microsoft Graph fails for another reason', async () => {
    listMeetingTranscriptsMock.mockRejectedValue(
      new GraphRequestError({
        message: 'Microsoft Graph request failed (503)',
        status: 503,
        innerErrorCode: undefined,
      }),
    );

    await expect(
      listTeamsOccurrenceTranscripts({
        accessToken: 'token',
        occurrences: WEEKLY_SYNC_OCCURRENCES,
      }),
    ).rejects.toThrow('503');
  });

  it('should fail when Microsoft Graph refuses the meeting lookup', async () => {
    getMeetingByJoinUrlMock.mockRejectedValue(
      new GraphRequestError({
        message: 'Microsoft Graph request failed (403)',
        status: 403,
        innerErrorCode: undefined,
      }),
    );

    await expect(
      listTeamsOccurrenceTranscripts({
        accessToken: 'token',
        occurrences: WEEKLY_SYNC_OCCURRENCES,
      }),
    ).rejects.toThrow('403');
    expect(listMeetingTranscriptsMock).not.toHaveBeenCalled();
  });
});
