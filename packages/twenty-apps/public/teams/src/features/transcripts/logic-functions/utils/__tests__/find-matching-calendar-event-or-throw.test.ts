import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { findMatchingCalendarEventOrThrow } from 'src/features/transcripts/logic-functions/utils/find-matching-calendar-event-or-throw';

const JOIN_WEB_URL =
  'https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc%40thread.v2/0';

const buildCoreApiClient = (
  calendarEventIds: string[],
): Pick<CoreApiClient, 'query'> => ({
  query: vi.fn().mockResolvedValue({
    calendarEvents: {
      edges: calendarEventIds.map((id) => ({ node: { id } })),
    },
  }),
});

describe('findMatchingCalendarEventOrThrow', () => {
  it('should link the calendar event with the join URL around the transcript start', async () => {
    const coreApiClient = buildCoreApiClient(['event-1']);

    await expect(
      findMatchingCalendarEventOrThrow({
        coreApiClient,
        meeting: { joinWebUrl: JOIN_WEB_URL },
        transcript: { createdDateTime: '2026-09-05T10:02:00Z' },
      }),
    ).resolves.toBe('event-1');
    expect(coreApiClient.query).toHaveBeenCalledWith({
      calendarEvents: expect.objectContaining({
        __args: expect.objectContaining({
          filter: {
            and: [
              { conferenceLink: { primaryLinkUrl: { eq: JOIN_WEB_URL } } },
              { startsAt: { lte: '2026-09-05T10:17:00.000Z' } },
              { endsAt: { gte: '2026-09-05T09:47:00.000Z' } },
              { isCanceled: { eq: false } },
            ],
          },
        }),
      }),
    });
  });

  it.each([
    ['no', []],
    ['several', ['event-1', 'event-2']],
  ])(
    'should not link when %s calendar events match',
    async (_, calendarEventIds) => {
      await expect(
        findMatchingCalendarEventOrThrow({
          coreApiClient: buildCoreApiClient(calendarEventIds),
          meeting: { joinWebUrl: JOIN_WEB_URL },
          transcript: { createdDateTime: '2026-09-05T10:02:00Z' },
        }),
      ).resolves.toBeUndefined();
    },
  );

  it.each([
    [
      'join URL',
      { joinWebUrl: null },
      { createdDateTime: '2026-09-05T10:02:00Z' },
    ],
    [
      'transcript start',
      { joinWebUrl: JOIN_WEB_URL },
      { createdDateTime: null },
    ],
    [
      'valid transcript start',
      { joinWebUrl: JOIN_WEB_URL },
      { createdDateTime: 'soon' },
    ],
  ])(
    'should not query calendar events without a %s',
    async (_, meeting, transcript) => {
      const coreApiClient = buildCoreApiClient(['event-1']);

      await expect(
        findMatchingCalendarEventOrThrow({
          coreApiClient,
          meeting,
          transcript,
        }),
      ).resolves.toBeUndefined();
      expect(coreApiClient.query).not.toHaveBeenCalled();
    },
  );
});
