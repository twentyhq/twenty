import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import {
  CALENDAR_EVENT_PAGE_SIZE,
  MAX_CALENDAR_EVENT_PAGES,
} from 'src/logic-functions/constants/calendar-event-matching.constant';
import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';
import { escapeSqlLikePattern } from 'src/logic-functions/utils/escape-sql-like-pattern.util';

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
  conferenceLinkFragment,
  cursor,
  pageIndex,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  earliestStart: string;
  latestStart: string;
  conferenceLinkFragment: string;
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
            {
              conferenceLink: {
                primaryLinkUrl: {
                  ilike: `%${escapeSqlLikePattern(conferenceLinkFragment)}%`,
                },
              },
            },
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

  if (!(pageInfo?.hasNextPage ?? false)) {
    return calendarEvents;
  }

  if (!isNonEmptyString(pageInfo?.endCursor)) {
    return undefined;
  }

  const followingCalendarEvents = await listCalendarEventPages({
    coreApiClient,
    earliestStart,
    latestStart,
    conferenceLinkFragment,
    cursor: pageInfo.endCursor,
    pageIndex: pageIndex + 1,
  });

  return isDefined(followingCalendarEvents)
    ? [...calendarEvents, ...followingCalendarEvents]
    : undefined;
};

export const listCalendarEventsInWindow = ({
  coreApiClient,
  earliestStart,
  latestStart,
  conferenceLinkFragment,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  earliestStart: string;
  latestStart: string;
  conferenceLinkFragment: string;
}): Promise<CalendarEventCandidate[] | undefined> =>
  listCalendarEventPages({
    coreApiClient,
    earliestStart,
    latestStart,
    conferenceLinkFragment,
    cursor: undefined,
    pageIndex: 0,
  });
