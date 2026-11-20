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

const GOOGLE_RESPONSES: Record<string, object> = {
  [`${MEET_API_URL}/conferenceRecords/first/transcripts?pageSize=100`]: {
    transcripts: [
      {
        name: 'conferenceRecords/first/transcripts/second',
        docsDestination: { document: 'transcript-document' },
      },
    ],
  },
  [`${MEET_API_URL}/conferenceRecords/first/smartNotes?pageSize=100`]: {
    smartNotes: [
      {
        name: 'conferenceRecords/first/smartNotes/third',
        state: 'FILE_GENERATED',
        docsDestination: { document: 'notes-document' },
      },
    ],
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
  'https://docs.googleapis.com/v1/documents/transcript-document?fields=title': {
    title: 'Meeting started 2026/11/17 18:10 IST - Notes by Gemini',
  },
  'https://docs.googleapis.com/v1/documents/notes-document?includeTabsContent=true':
    {
      tabs: [
        {
          documentTab: {
            body: {
              content: [
                {
                  paragraph: {
                    elements: [{ textRun: { content: 'Summary\n' } }],
                    paragraphStyle: { namedStyleType: 'HEADING_2' },
                  },
                },
                {
                  paragraph: {
                    elements: [
                      { textRun: { content: 'Alice shared the plan.\n' } },
                    ],
                  },
                },
              ],
            },
          },
        },
        {
          documentTab: {
            body: {
              content: [
                {
                  paragraph: {
                    elements: [{ textRun: { content: 'Alice: Hello.\n' } }],
                  },
                },
              ],
            },
          },
        },
      ],
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
                  title: ' Customer call ',
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
      async (url) => new Response(JSON.stringify(GOOGLE_RESPONSES[url] ?? {})),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create a call recording with the transcript, Gemini notes and calendar event', async () => {
    const coreApiClient = buildCoreApiClient();

    await expect(
      syncGoogleMeetConferenceOrThrow({
        accessToken: 'token',
        coreApiClient,
        conferenceRecord: CONFERENCE_RECORD,
      }),
    ).resolves.toEqual({ outcome: 'CREATED', shouldGenerateAiSummary: false });

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
            summary: {
              blocknote: null,
              markdown: '## Summary\n\nAlice shared the plan.',
            },
            calendarEventId: 'calendar-event-id',
          },
        },
        id: true,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(7);
  });

  it('should not write a call recording for a conference without transcript, notes or recording', async () => {
    fetchMock.mockImplementation(async () => new Response('{}'));

    const coreApiClient = buildCoreApiClient();

    await expect(
      syncGoogleMeetConferenceOrThrow({
        accessToken: 'token',
        coreApiClient,
        conferenceRecord: CONFERENCE_RECORD,
      }),
    ).resolves.toEqual({
      outcome: 'NO_ARTIFACT',
      shouldGenerateAiSummary: false,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(coreApiClient.query).not.toHaveBeenCalled();
    expect(coreApiClient.mutation).not.toHaveBeenCalled();
  });

  it('should complete a conference that only has a recording and import its first video', async () => {
    fetchMock.mockImplementation(async (url) =>
      url ===
      `${MEET_API_URL}/conferenceRecords/first/recordings?pageSize=100`
        ? new Response(
            JSON.stringify({
              recordings: [
                {
                  name: 'conferenceRecords/first/recordings/fourth',
                  state: 'FILE_GENERATED',
                },
                {
                  name: 'conferenceRecords/first/recordings/fifth',
                  state: 'FILE_GENERATED',
                },
              ],
            }),
          )
        : new Response('{}'),
    );

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
    ).resolves.toEqual({
      outcome: 'CREATED',
      shouldGenerateAiSummary: false,
      recordingNameToImport: 'conferenceRecords/first/recordings/fourth',
    });

    const recordingData =
      coreApiClient.mutation.mock.calls[0][0].createCallRecording.__args.data;

    expect(recordingData.status).toBe('COMPLETED');
    expect(recordingData).not.toHaveProperty('transcript');
    expect(recordingData).not.toHaveProperty('summary');
  });

  it('should name a conference without calendar event after its transcript document', async () => {
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
    ).resolves.toEqual({ outcome: 'CREATED', shouldGenerateAiSummary: false });

    expect(fetchMock).toHaveBeenCalledTimes(7);
    expect(coreApiClient.mutation).toHaveBeenCalledTimes(1);

    const recordingData =
      coreApiClient.mutation.mock.calls[0][0].createCallRecording.__args.data;

    expect(recordingData.title).toBe('Meeting started 2026/11/17 18:10 IST');
    expect(recordingData).not.toHaveProperty('calendarEventId');
  });

  it('should ask for an AI summary of a conference that has no Gemini notes', async () => {
    fetchMock.mockImplementation(async (url) => {
      if (url.includes('/smartNotes')) {
        return new Response('{}');
      }

      return new Response(JSON.stringify(GOOGLE_RESPONSES[url] ?? {}));
    });

    const coreApiClient = buildCoreApiClient();

    await expect(
      syncGoogleMeetConferenceOrThrow({
        accessToken: 'token',
        coreApiClient,
        conferenceRecord: CONFERENCE_RECORD,
      }),
    ).resolves.toEqual({ outcome: 'CREATED', shouldGenerateAiSummary: true });

    expect(
      coreApiClient.mutation.mock.calls[0][0].createCallRecording.__args.data,
    ).not.toHaveProperty('summary');
  });

  it('should import the transcript of a conference whose documents cannot be read', async () => {
    fetchMock.mockImplementation(async (url) => {
      if (url.startsWith('https://docs.googleapis.com/')) {
        return new Response(
          JSON.stringify({ error: { status: 'PERMISSION_DENIED' } }),
          { status: 403 },
        );
      }

      return new Response(JSON.stringify(GOOGLE_RESPONSES[url] ?? {}));
    });

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
    ).resolves.toEqual({ outcome: 'CREATED', shouldGenerateAiSummary: true });

    const recordingData =
      coreApiClient.mutation.mock.calls[0][0].createCallRecording.__args.data;

    expect(recordingData.status).toBe('COMPLETED');
    expect(recordingData).not.toHaveProperty('title');
    expect(recordingData).not.toHaveProperty('summary');
  });
});
