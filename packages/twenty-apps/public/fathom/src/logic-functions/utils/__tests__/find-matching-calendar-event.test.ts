import { type Meeting } from 'fathom-typescript/sdk/models/shared';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

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

const buildCoreApiClient = (
  candidates: Array<{
    id: string;
    startsAt: string;
    conferenceLink: { primaryLinkUrl: string };
  }>,
) =>
  ({
    query: vi.fn().mockResolvedValue({
      calendarEvents: {
        edges: candidates.map((candidate) => ({ node: candidate })),
      },
    }),
  }) as unknown as CoreApiClient;

describe('findMatchingCalendarEvent', () => {
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
        {
          id: 'exact-event',
          startsAt: '2026-01-01T10:00:00.000Z',
          conferenceLink: {
            primaryLinkUrl: 'https://meet.google.com/abc-defg-hij',
          },
        },
      ]),
      meeting: buildMeeting(),
    });

    expect(calendarEventId).toBe('exact-event');
  });

  it('does not guess when two reused-link events are equally close', async () => {
    const calendarEventId = await findMatchingCalendarEvent({
      coreApiClient: buildCoreApiClient([
        {
          id: 'before-event',
          startsAt: '2026-01-01T09:59:00.000Z',
          conferenceLink: {
            primaryLinkUrl: 'https://meet.google.com/abc-defg-hij',
          },
        },
        {
          id: 'after-event',
          startsAt: '2026-01-01T10:01:00.000Z',
          conferenceLink: {
            primaryLinkUrl: 'https://meet.google.com/abc-defg-hij',
          },
        },
      ]),
      meeting: buildMeeting(),
    });

    expect(calendarEventId).toBeUndefined();
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
