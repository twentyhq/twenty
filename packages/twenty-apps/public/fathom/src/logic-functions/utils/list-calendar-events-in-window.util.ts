import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  CALENDAR_EVENT_PAGE_SIZE,
  MAX_CALENDAR_EVENT_PAGES,
} from 'src/constants/fathom.constant';
import { type CalendarEventCandidate } from 'src/logic-functions/types/calendar-event-candidate.type';

type CalendarEventsPage = {
  calendarEvents?: {
    edges?: Array<{ node: CalendarEventCandidate }>;
    pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  };
};

// Matching is only conservative when every event in the window was compared,
// so a window that cannot be read to the end yields undefined, not a partial list.
export const listCalendarEventsInWindow = async ({
  coreApiClient,
  earliestStart,
  latestStart,
}: {
  coreApiClient: Pick<CoreApiClient, 'query'>;
  earliestStart: string;
  latestStart: string;
}): Promise<CalendarEventCandidate[] | undefined> => {
  const calendarEvents: CalendarEventCandidate[] = [];
  let cursor: string | undefined = undefined;

  for (let page = 0; page < MAX_CALENDAR_EVENT_PAGES; page++) {
    const queryResult: CalendarEventsPage = await coreApiClient.query({
      calendarEvents: {
        __args: {
          // The API applies one operator per field filter, so a range is two and-ed entries.
          filter: {
            and: [
              { startsAt: { gte: earliestStart } },
              { startsAt: { lte: latestStart } },
              { isCanceled: { eq: false } },
            ],
          },
          first: CALENDAR_EVENT_PAGE_SIZE,
          ...(cursor === undefined ? {} : { after: cursor }),
        },
        edges: {
          node: {
            id: true,
            startsAt: true,
            conferenceLink: {
              primaryLinkUrl: true,
            },
          },
        },
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
      },
    });
    const pageInfo = queryResult.calendarEvents?.pageInfo;

    calendarEvents.push(
      ...(queryResult.calendarEvents?.edges ?? []).map((edge) => edge.node),
    );

    if (pageInfo?.hasNextPage !== true) {
      return calendarEvents;
    }

    if (!isNonEmptyString(pageInfo.endCursor)) {
      return undefined;
    }

    cursor = pageInfo.endCursor;
  }

  return undefined;
};
