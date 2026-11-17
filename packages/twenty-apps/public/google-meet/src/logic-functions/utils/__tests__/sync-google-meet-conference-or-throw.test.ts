import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { computeCallRecordingIdForGoogleMeetConference } from 'src/logic-functions/utils/compute-call-recording-id-for-google-meet-conference.util';
import { syncGoogleMeetConferenceOrThrow } from 'src/logic-functions/utils/sync-google-meet-conference-or-throw.util';

const CONFERENCE_RECORD = {
  name: 'conferenceRecords/first',
  startTime: '2026-11-17T09:00:00Z',
  endTime: '2026-11-17T09:30:00Z',
  space: 'spaces/meeting-space',
};

const MEET_API_URL = 'https://meet.googleapis.com/v2';

const MEET_RESPONSES: Record<string, object> = {
  [`${MEET_API_URL}/conferenceRecords/first/transcripts?pageSize=100`]: {
    transcripts: [{ name: 'conferenceRecords/first/transcripts/second' }],
  },
  [`${MEET_API_URL}/conferenceRecords/first/participants?pageSize=100`]: {
    participants: [
      {
        name: 'conferenceRecords/first/participants/alice',
        signedinUser: { displayName: 'Alice Martin' },
      },
    ],
  },
  [`${MEET_API_URL}/conferenceRecords/first/transcripts/second/entries?pageSize=100`]:
    {
      transcriptEntries: [
        {
          participant: 'conferenceRecords/first/participants/alice',
          text: 'Hello.',
          startTime: '2026-11-17T09:00:05Z',
        },
      ],
    },
  [`${MEET_API_URL}/spaces/meeting-space`]: {
    name: 'spaces/meeting-space',
    meetingUri: 'https://meet.google.com/abc-mnop-xyz',
  },
};

const fetchMock = vi.fn<(url: string) => Promise<Response>>();

const buildCoreApiClient = () => ({
  query: vi.fn(async (query: object) =>
    'calendarEvents' in query
      ? {
          calendarEvents: {
            edges: [
              {
                node: {
                  id: 'calendar-event-id',
                  title: 'Customer call',
                  startsAt: '2026-11-17T09:00:00.000Z',
                  conferenceLink: {
                    primaryLinkUrl: 'https://meet.google.com/abc-mnop-xyz',
                  },
                },
              },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        }
      : { callRecordings: { edges: [] } },
  ),
  mutation: vi.fn().mockResolvedValue({}),
});

describe('syncGoogleMeetConferenceOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockImplementation(
      async (url) => new Response(JSON.stringify(MEET_RESPONSES[url] ?? {})),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create a call recording with the transcript and its calendar event', async () => {
    const coreApiClient = buildCoreApiClient();

    await expect(
      syncGoogleMeetConferenceOrThrow({
        accessToken: 'token',
        coreApiClient,
        conferenceRecord: CONFERENCE_RECORD,
      }),
    ).resolves.toBe('CREATED');

    expect(coreApiClient.mutation).toHaveBeenCalledExactlyOnceWith({
      createCallRecording: {
        __args: {
          data: {
            id: computeCallRecordingIdForGoogleMeetConference(
              'conferenceRecords/first',
            ),
            title: 'Customer call',
            status: 'COMPLETED',
            externalRecordingId: 'conferenceRecords/first',
            startedAt: '2026-11-17T09:00:00Z',
            endedAt: '2026-11-17T09:30:00Z',
            transcript: [
              {
                participant: { name: 'Alice Martin' },
                words: [{ text: 'Hello.', start_timestamp: { relative: 5 } }],
              },
            ],
            calendarEventId: 'calendar-event-id',
          },
        },
        id: true,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('should not write a call recording for a conference without transcript', async () => {
    fetchMock.mockImplementation(async () => new Response('{}'));

    const coreApiClient = buildCoreApiClient();

    await expect(
      syncGoogleMeetConferenceOrThrow({
        accessToken: 'token',
        coreApiClient,
        conferenceRecord: CONFERENCE_RECORD,
      }),
    ).resolves.toBe('NO_TRANSCRIPT');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(coreApiClient.query).not.toHaveBeenCalled();
    expect(coreApiClient.mutation).not.toHaveBeenCalled();
  });

  it('should import a conference without space unlinked from any calendar event', async () => {
    const coreApiClient = buildCoreApiClient();

    await expect(
      syncGoogleMeetConferenceOrThrow({
        accessToken: 'token',
        coreApiClient,
        conferenceRecord: {
          name: CONFERENCE_RECORD.name,
          startTime: CONFERENCE_RECORD.startTime,
        },
      }),
    ).resolves.toBe('CREATED');

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(coreApiClient.mutation).toHaveBeenCalledTimes(1);
    expect(
      coreApiClient.mutation.mock.calls[0][0].createCallRecording.__args.data,
    ).not.toHaveProperty('calendarEventId');
  });
});
