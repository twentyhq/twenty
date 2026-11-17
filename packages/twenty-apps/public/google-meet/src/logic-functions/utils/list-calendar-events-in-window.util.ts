import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  CALENDAR_EVENT_PAGE_SIZE,
  MAX_CALENDAR_EVENT_PAGES,
} from 'src/logic-functions/constants/calendar-event-matching.constant';
import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';

type CalendarEventsPage = {
  calendarEvents?: {
    edges?: Array<{
      node: {
        id: string;
        title?: string | null;
        startsAt?: string | null;
        conferenceLink?: CalendarEventCandidate['conferenceLink'];
      };
    }>;
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  };
};

// A partial list could match the wrong event, so an unreadable window yields undefined.
const listCalendarEventPages = async ({
  coreApiClient,
  earliestStart,
  latestStart,
  cursor,
  pageIndex,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  earliestStart: string;
  latestStart: string;
  cursor: string | undefined;
  pageIndex: number;
}): Promise<CalendarEventCandidate[] | undefined> => {
  if (pageIndex >= MAX_CALENDAR_EVENT_PAGES) {
    return undefined;
  }

  const queryResult: CalendarEventsPage = await coreApiClient.query({
    calendarEvents: {
      __args: {
        filter: {
          and: [
            { startsAt: { gte: earliestStart } },
            { startsAt: { lte: latestStart } },
            { isCanceled: { eq: false } },
          ],
        },
        first: CALENDAR_EVENT_PAGE_SIZE,
        ...(isNonEmptyString(cursor) ? { after: cursor } : {}),
      },
      edges: {
        node: {
          id: true,
          title: true,
          startsAt: true,
          conferenceLink: { primaryLinkUrl: true },
        },
      },
      pageInfo: { hasNextPage: true, endCursor: true },
    },
  });
  const nodes = (queryResult.calendarEvents?.edges ?? []).map(
    ({ node }) => node,
  );
  const calendarEvents = nodes.flatMap(
    ({ id, title, startsAt, conferenceLink }) =>
      isNonEmptyString(startsAt)
        ? [
            {
              id,
              title: title ?? null,
              startsAt,
              conferenceLink: conferenceLink ?? null,
            },
          ]
        : [],
  );

  if (calendarEvents.length !== nodes.length) {
    return undefined;
  }

  const pageInfo = queryResult.calendarEvents?.pageInfo;

  if (pageInfo?.hasNextPage !== true) {
    return calendarEvents;
  }

  if (!isNonEmptyString(pageInfo.endCursor)) {
    return undefined;
  }

  const followingCalendarEvents = await listCalendarEventPages({
    coreApiClient,
    earliestStart,
    latestStart,
    cursor: pageInfo.endCursor,
    pageIndex: pageIndex + 1,
  });

  return followingCalendarEvents === undefined
    ? undefined
    : [...calendarEvents, ...followingCalendarEvents];
};

export const listCalendarEventsInWindow = ({
  coreApiClient,
  earliestStart,
  latestStart,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  earliestStart: string;
  latestStart: string;
}): Promise<CalendarEventCandidate[] | undefined> =>
  listCalendarEventPages({
    coreApiClient,
    earliestStart,
    latestStart,
    cursor: undefined,
    pageIndex: 0,
  });
