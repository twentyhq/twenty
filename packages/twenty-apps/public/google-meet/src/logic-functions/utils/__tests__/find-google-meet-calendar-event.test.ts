import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';
import { findGoogleMeetCalendarEvent } from 'src/logic-functions/utils/find-google-meet-calendar-event.util';

const MEETING_URI = 'https://meet.google.com/abc-mnop-xyz';

const buildCandidate = ({
  id,
  startsAt,
  primaryLinkUrl = MEETING_URI,
}: {
  id: string;
  startsAt: string;
  primaryLinkUrl?: string;
}): CalendarEventCandidate => ({
  id,
  title: `Title of ${id}`,
  startsAt,
  conferenceLink: { primaryLinkUrl },
});

const buildCoreApiClient = (
  candidates: CalendarEventCandidate[],
): Pick<CoreApiClient, 'query'> => ({
  query: vi.fn().mockResolvedValue({
    calendarEvents: {
      edges: candidates.map((candidate) => ({ node: candidate })),
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  }),
});

const findCalendarEvent = ({
  coreApiClient,
  meetingUri = MEETING_URI,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  meetingUri?: string;
}) =>
  findGoogleMeetCalendarEvent({
    coreApiClient,
    conferenceRecord: { startTime: '2026-11-17T09:02:00.000Z' },
    space: { meetingUri },
  });

describe('findGoogleMeetCalendarEvent', () => {
  it('should search live events starting within an hour of the conference', async () => {
    const coreApiClient = buildCoreApiClient([]);

    await findCalendarEvent({ coreApiClient });

    expect(coreApiClient.query).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        calendarEvents: expect.objectContaining({
          __args: expect.objectContaining({
            filter: {
              and: [
                { startsAt: { gte: '2026-11-17T08:02:00.000Z' } },
                { startsAt: { lte: '2026-11-17T10:02:00.000Z' } },
                { isCanceled: { eq: false } },
                {
                  conferenceLink: {
                    primaryLinkUrl: { ilike: '%abc-mnop-xyz%' },
                  },
                },
              ],
            },
          }),
        }),
      }),
    );
  });

  it('should match the event with the same Meet link that starts closest to the conference', async () => {
    const coreApiClient = buildCoreApiClient([
      buildCandidate({ id: 'earlier', startsAt: '2026-11-17T08:30:00.000Z' }),
      buildCandidate({ id: 'closest', startsAt: '2026-11-17T09:00:00.000Z' }),
      buildCandidate({
        id: 'other-link',
        startsAt: '2026-11-17T09:02:00.000Z',
        primaryLinkUrl: 'https://meet.google.com/zzz-zzzz-zzz',
      }),
    ]);

    await expect(findCalendarEvent({ coreApiClient })).resolves.toEqual({
      id: 'closest',
      title: 'Title of closest',
    });
    expect(coreApiClient.query).toHaveBeenCalledTimes(1);
  });

  it('should match no event when two are equally close', async () => {
    const coreApiClient = buildCoreApiClient([
      buildCandidate({ id: 'before', startsAt: '2026-11-17T09:00:00.000Z' }),
      buildCandidate({ id: 'after', startsAt: '2026-11-17T09:04:00.000Z' }),
    ]);

    await expect(findCalendarEvent({ coreApiClient })).resolves.toBeUndefined();
    expect(coreApiClient.query).toHaveBeenCalledTimes(1);
  });

  it('should match no event when none shares the Meet link', async () => {
    const coreApiClient = buildCoreApiClient([
      buildCandidate({
        id: 'other-link',
        startsAt: '2026-11-17T09:00:00.000Z',
        primaryLinkUrl: 'https://meet.google.com/zzz-zzzz-zzz',
      }),
    ]);

    await expect(findCalendarEvent({ coreApiClient })).resolves.toBeUndefined();
    expect(coreApiClient.query).toHaveBeenCalledTimes(1);
  });

  it('should not search when the space has no meeting link', async () => {
    const coreApiClient = buildCoreApiClient([]);

    await expect(
      findCalendarEvent({ coreApiClient, meetingUri: '' }),
    ).resolves.toBeUndefined();
    expect(coreApiClient.query).not.toHaveBeenCalled();
  });
});
