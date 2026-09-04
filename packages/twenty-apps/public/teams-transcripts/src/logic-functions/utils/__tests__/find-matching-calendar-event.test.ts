import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { findMatchingCalendarEvent } from 'src/logic-functions/utils/find-matching-calendar-event.util';

type CalendarEventCandidateFixture = {
  id: string;
  startsAt: string;
  conferenceLink: { primaryLinkUrl: string };
};

const JOIN_URL =
  'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc%40thread.v2/0?context=%7b%22Tid%22%3a%22t%22%7d';
const START = '2026-01-01T10:00:00.000Z';

const buildCoreApiClient = (
  candidates: CalendarEventCandidateFixture[],
): Pick<CoreApiClient, 'query'> => ({
  query: vi.fn().mockResolvedValue({
    calendarEvents: {
      edges: candidates.map((candidate) => ({ node: candidate })),
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  }),
});

describe('findMatchingCalendarEvent', () => {
  it('matches the event whose conference link equals the join url', async () => {
    const coreApiClient = buildCoreApiClient([
      {
        id: 'other',
        startsAt: START,
        conferenceLink: { primaryLinkUrl: 'https://meet.google.com/abc' },
      },
      {
        id: 'teams-event',
        startsAt: '2026-01-01T10:01:00.000Z',
        conferenceLink: { primaryLinkUrl: JOIN_URL },
      },
    ]);

    expect(
      await findMatchingCalendarEvent({
        coreApiClient,
        joinWebUrl: JOIN_URL,
        startDateTime: START,
      }),
    ).toBe('teams-event');
  });

  it('returns undefined when two events tie on start time', async () => {
    const coreApiClient = buildCoreApiClient([
      { id: 'first', startsAt: START, conferenceLink: { primaryLinkUrl: JOIN_URL } },
      { id: 'second', startsAt: START, conferenceLink: { primaryLinkUrl: JOIN_URL } },
    ]);

    expect(
      await findMatchingCalendarEvent({
        coreApiClient,
        joinWebUrl: JOIN_URL,
        startDateTime: START,
      }),
    ).toBeUndefined();
  });

  it('skips the lookup when the meeting has no join url', async () => {
    const coreApiClient = buildCoreApiClient([]);

    expect(
      await findMatchingCalendarEvent({
        coreApiClient,
        joinWebUrl: null,
        startDateTime: START,
      }),
    ).toBeUndefined();
    expect(coreApiClient.query).not.toHaveBeenCalled();
  });
});
