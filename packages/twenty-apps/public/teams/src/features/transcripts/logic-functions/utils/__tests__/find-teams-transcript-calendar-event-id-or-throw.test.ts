import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { fetchGraphJson } from 'src/features/transcripts/logic-functions/utils/fetch-graph-json';
import { findTeamsTranscriptCalendarEventIdOrThrow } from 'src/features/transcripts/logic-functions/utils/find-teams-transcript-calendar-event-id-or-throw';

vi.mock(
  'src/features/transcripts/logic-functions/utils/fetch-graph-json',
  () => ({
    fetchGraphJson: vi.fn(),
  }),
);

const JOIN_WEB_URL =
  'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc%40thread.v2/0';

const NEXT_PAGE_URL =
  'https://graph.microsoft.com/v1.0/me/calendarView?$skip=50';

const TRANSCRIPT = { createdDateTime: '2026-09-19T10:02:00Z' };

const buildCalendarEvent = (overrides: Record<string, unknown> = {}) => ({
  id: 'occurrence-3',
  iCalUId: 'ical-occurrence-3',
  seriesMasterId: 'series-master-1',
  isOrganizer: true,
  isCancelled: false,
  onlineMeetingProvider: 'teamsForBusiness',
  onlineMeeting: { joinUrl: JOIN_WEB_URL },
  start: { dateTime: '2026-09-19T10:00:00.0000000', timeZone: 'UTC' },
  end: { dateTime: '2026-09-19T10:30:00.0000000', timeZone: 'UTC' },
  ...overrides,
});

const mockGraph = (responses: Record<string, unknown>) =>
  vi.mocked(fetchGraphJson).mockImplementation(async ({ url }) => {
    const responseKey = Object.keys(responses).find((key) =>
      url.startsWith(key),
    );
    const response = responseKey === undefined ? {} : responses[responseKey];

    if (response instanceof Error) {
      throw response;
    }

    return response;
  });

const buildCoreApiClient = ({
  associations = [],
  calendarEvents = [],
}: {
  associations?: { eventExternalId: string; calendarEventId: string }[];
  calendarEvents?: { id: string; iCalUid: string }[];
}) => ({
  query: vi.fn().mockImplementation(async (request: object) => {
    const nodes =
      'calendarChannelEventAssociations' in request
        ? associations
        : calendarEvents;
    const objectName = Object.keys(request)[0];

    return {
      [objectName]: {
        edges: nodes.map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    };
  }),
});

describe('findTeamsTranscriptCalendarEventIdOrThrow', () => {
  beforeEach(() => {
    vi.mocked(fetchGraphJson).mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('should link an occurrence of a recurring meeting to the series event', async () => {
    mockGraph({
      'me/calendarView': {
        value: [
          buildCalendarEvent(),
          buildCalendarEvent({
            id: 'other-meeting',
            seriesMasterId: null,
            onlineMeeting: { joinUrl: `${JOIN_WEB_URL}-other` },
          }),
        ],
      },
    });
    const coreApiClient = buildCoreApiClient({
      associations: [
        {
          eventExternalId: 'series-master-1',
          calendarEventId: 'series-calendar-event',
        },
      ],
    });

    await expect(
      findTeamsTranscriptCalendarEventIdOrThrow({
        accessToken: 'token',
        coreApiClient,
        meeting: { joinWebUrl: JOIN_WEB_URL },
        transcript: TRANSCRIPT,
      }),
    ).resolves.toBe('series-calendar-event');
    expect(fetchGraphJson).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('%24top=1000'),
      }),
    );
    expect(coreApiClient.query).toHaveBeenCalledTimes(1);
    expect(coreApiClient.query).toHaveBeenCalledWith({
      calendarChannelEventAssociations: expect.objectContaining({
        __args: expect.objectContaining({
          filter: { eventExternalId: { in: ['series-master-1'] } },
        }),
      }),
    });
  });

  it("should fall back on the series master's iCalUId when no association exists", async () => {
    mockGraph({
      'me/calendarView': { value: [buildCalendarEvent()] },
      'me/events/series-master-1': { iCalUId: 'ical-series-master-1' },
    });
    const coreApiClient = buildCoreApiClient({
      calendarEvents: [
        { id: 'attendee-calendar-event', iCalUid: 'ical-series-master-1' },
      ],
    });

    await expect(
      findTeamsTranscriptCalendarEventIdOrThrow({
        accessToken: 'token',
        coreApiClient,
        meeting: { joinWebUrl: JOIN_WEB_URL },
        transcript: TRANSCRIPT,
      }),
    ).resolves.toBe('attendee-calendar-event');
    expect(coreApiClient.query).toHaveBeenLastCalledWith({
      calendarEvents: expect.objectContaining({
        __args: expect.objectContaining({
          filter: {
            iCalUid: { in: ['ical-series-master-1'] },
            isCanceled: { eq: false },
          },
        }),
      }),
    });
  });

  it('should find the meeting on a later calendar page', async () => {
    mockGraph({
      [NEXT_PAGE_URL]: { value: [buildCalendarEvent()] },
      'me/calendarView': {
        value: [],
        '@odata.nextLink': NEXT_PAGE_URL,
      },
    });

    await expect(
      findTeamsTranscriptCalendarEventIdOrThrow({
        accessToken: 'token',
        coreApiClient: buildCoreApiClient({
          associations: [
            {
              eventExternalId: 'series-master-1',
              calendarEventId: 'series-calendar-event',
            },
          ],
        }),
        meeting: { joinWebUrl: JOIN_WEB_URL },
        transcript: TRANSCRIPT,
      }),
    ).resolves.toBe('series-calendar-event');
  });

  it.each([403, 404, 500])(
    'should leave the transcript unlinked when the calendar lookup answers %s',
    async (status) => {
      mockGraph({
        'me/calendarView': new GraphRequestError({
          message: `Microsoft Graph request failed (${status})`,
          status,
          innerErrorCode: undefined,
        }),
      });
      const coreApiClient = buildCoreApiClient({});

      await expect(
        findTeamsTranscriptCalendarEventIdOrThrow({
          accessToken: 'token',
          coreApiClient,
          meeting: { joinWebUrl: JOIN_WEB_URL },
          transcript: TRANSCRIPT,
        }),
      ).resolves.toBeUndefined();
      expect(coreApiClient.query).not.toHaveBeenCalled();
    },
  );

  it('should leave the transcript unlinked when the series master cannot be read', async () => {
    mockGraph({
      'me/calendarView': { value: [buildCalendarEvent()] },
      'me/events/series-master-1': new GraphRequestError({
        message: 'Microsoft Graph request failed (500)',
        status: 500,
        innerErrorCode: undefined,
      }),
    });

    await expect(
      findTeamsTranscriptCalendarEventIdOrThrow({
        accessToken: 'token',
        coreApiClient: buildCoreApiClient({}),
        meeting: { joinWebUrl: JOIN_WEB_URL },
        transcript: TRANSCRIPT,
      }),
    ).resolves.toBeUndefined();
  });

  it.each([
    ['no join URL', { joinWebUrl: null }, TRANSCRIPT],
    ['no transcript start', { joinWebUrl: JOIN_WEB_URL }, {}],
    [
      'an invalid transcript start',
      { joinWebUrl: JOIN_WEB_URL },
      { createdDateTime: 'not-a-date' },
    ],
  ])(
    'should not look up the calendar for a meeting with %s',
    async (_, meeting, transcript) => {
      await expect(
        findTeamsTranscriptCalendarEventIdOrThrow({
          accessToken: 'token',
          coreApiClient: buildCoreApiClient({}),
          meeting,
          transcript,
        }),
      ).resolves.toBeUndefined();
      expect(fetchGraphJson).not.toHaveBeenCalled();
    },
  );
});
