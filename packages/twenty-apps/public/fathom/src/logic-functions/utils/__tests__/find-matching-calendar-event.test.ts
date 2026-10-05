import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { MAX_CALENDAR_EVENT_PAGES } from 'src/constants/fathom.constant';
import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event.util';

const buildMeeting = (overrides: Partial<Meeting> = {}): Meeting => ({
  title: 'Customer call',
  meetingTitle: 'Customer call',
  meetingType: null,
  recordingId: 123,
  url: 'https://fathom.video/calls/123',
  meetingUrl: 'https://meet.google.com/abc-defg-hij',
  shareUrl: 'https://fathom.video/share/123',
  createdAt: new Date('2026-01-01T10:00:00.000Z'),
  scheduledStartTime: new Date('2026-01-01T10:00:00.000Z'),
  scheduledEndTime: new Date('2026-01-01T10:30:00.000Z'),
  recordingStartTime: new Date('2026-01-01T10:00:10.000Z'),
  recordingEndTime: new Date('2026-01-01T10:29:00.000Z'),
  calendarInviteesDomainsType: 'one_or_more_external',
  sharedWith: 'no_teams',
  transcriptLanguage: 'en',
  calendarInvitees: [],
  recordedBy: {
    name: 'Ada',
    email: 'ada@example.com',
    emailDomain: 'example.com',
    team: null,
  },
  ...overrides,
});

type CalendarEventCandidateFixture = {
  id: string;
  startsAt: string;
  conferenceLink: { primaryLinkUrl: string };
};

const buildPage = (
  candidates: CalendarEventCandidateFixture[],
  pageInfo: { hasNextPage: boolean; endCursor: string | null } = {
    hasNextPage: false,
    endCursor: null,
  },
) => ({
  calendarEvents: {
    edges: candidates.map((candidate) => ({ node: candidate })),
    pageInfo,
  },
});

const buildCoreApiClient = (
  candidates: CalendarEventCandidateFixture[],
): Pick<CoreApiClient, 'query'> => ({
  query: vi.fn().mockResolvedValue(buildPage(candidates)),
});

const EXACT_EVENT: CalendarEventCandidateFixture = {
  id: 'exact-event',
  startsAt: '2026-01-01T10:00:00.000Z',
  conferenceLink: { primaryLinkUrl: 'https://meet.google.com/abc-defg-hij' },
};

describe('findMatchingCalendarEvent', () => {
  it('queries live events in a five minute window around the scheduled start', async () => {
    const coreApiClient = buildCoreApiClient([]);

    await findMatchingCalendarEvent({ coreApiClient, meeting: buildMeeting() });

    expect(coreApiClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        calendarEvents: expect.objectContaining({
          __args: expect.objectContaining({
            filter: {
              and: [
                { startsAt: { gte: '2026-01-01T09:55:00.000Z' } },
                { startsAt: { lte: '2026-01-01T10:05:00.000Z' } },
                { isCanceled: { eq: false } },
              ],
            },
          }),
        }),
      }),
    );
  });

  it('matches an exact meeting URL to the nearest scheduled event', async () => {
    const calendarEventId = await findMatchingCalendarEvent({
      coreApiClient: buildCoreApiClient([
        {
          id: 'later-event',
          startsAt: '2026-01-01T10:03:00.000Z',
          conferenceLink: {
            primaryLinkUrl: 'https://meet.google.com/abc-defg-hij/',
          },
        },
        EXACT_EVENT,
      ]),
      meeting: buildMeeting(),
    });

    expect(calendarEventId).toBe('exact-event');
  });

  it('ignores www, case, query strings, fragments and trailing slashes when comparing URLs', async () => {
    const calendarEventId = await findMatchingCalendarEvent({
      coreApiClient: buildCoreApiClient([
        {
          ...EXACT_EVENT,
          conferenceLink: {
            primaryLinkUrl:
              'https://WWW.meet.google.com/abc-defg-hij//?authuser=1#details',
          },
        },
      ]),
      meeting: buildMeeting({
        meetingUrl: 'https://meet.google.com/abc-defg-hij?hs=122',
      }),
    });

    expect(calendarEventId).toBe('exact-event');
  });

  it('does not guess when two reused-link events are equally close', async () => {
    const calendarEventId = await findMatchingCalendarEvent({
      coreApiClient: buildCoreApiClient([
        {
          ...EXACT_EVENT,
          id: 'before-event',
          startsAt: '2026-01-01T09:59:00.000Z',
        },
        {
          ...EXACT_EVENT,
          id: 'after-event',
          startsAt: '2026-01-01T10:01:00.000Z',
        },
      ]),
      meeting: buildMeeting(),
    });

    expect(calendarEventId).toBeUndefined();
  });

  it('matches an event that only appears on a later page', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce(
        buildPage(
          [
            {
              id: 'unrelated-event',
              startsAt: '2026-01-01T10:00:00.000Z',
              conferenceLink: {
                primaryLinkUrl: 'https://meet.google.com/zzz-zzzz-zzz',
              },
            },
          ],
          { hasNextPage: true, endCursor: 'cursor-1' },
        ),
      )
      .mockResolvedValueOnce(
        buildPage([{ ...EXACT_EVENT, id: 'paged-event' }]),
      );

    expect(
      await findMatchingCalendarEvent({
        coreApiClient: { query },
        meeting: buildMeeting(),
      }),
    ).toBe('paged-event');
    expect(query).toHaveBeenCalledTimes(2);
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        calendarEvents: expect.objectContaining({
          __args: expect.objectContaining({ after: 'cursor-1' }),
        }),
      }),
    );
  });

  it('does not guess from a window it could not read to the end', async () => {
    const query = vi
      .fn()
      .mockResolvedValue(
        buildPage([EXACT_EVENT], { hasNextPage: true, endCursor: 'cursor-1' }),
      );

    expect(
      await findMatchingCalendarEvent({
        coreApiClient: { query },
        meeting: buildMeeting(),
      }),
    ).toBeUndefined();
    expect(query).toHaveBeenCalledTimes(MAX_CALENDAR_EVENT_PAGES);
  });

  it('does not guess when a page claims more results but carries no cursor', async () => {
    const query = vi
      .fn()
      .mockResolvedValue(
        buildPage([EXACT_EVENT], { hasNextPage: true, endCursor: null }),
      );

    expect(
      await findMatchingCalendarEvent({
        coreApiClient: { query },
        meeting: buildMeeting(),
      }),
    ).toBeUndefined();
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('does not query CalendarEvents without Fathom meeting_url', async () => {
    const coreApiClient = buildCoreApiClient([]);

    expect(
      await findMatchingCalendarEvent({
        coreApiClient,
        meeting: buildMeeting({ meetingUrl: null }),
      }),
    ).toBeUndefined();
    expect(coreApiClient.query).not.toHaveBeenCalled();
  });
});
