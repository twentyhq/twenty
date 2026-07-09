import { isString, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { resolveConferenceLinkUrl } from 'src/logic-functions/domain/resolve-conference-link-url.util';
import { stripRestrictedFieldValue } from 'src/logic-functions/data/strip-restricted-field-value.util';

type CalendarEventNode = {
  id: string;
  title?: string | null;
  isCanceled?: boolean | null;
  startsAt?: string | null;
  endsAt?: string | null;
  iCalUid?: string | null;
  conferenceLink?: { primaryLinkUrl?: string | null } | null;
  location?: string | null;
  description?: string | null;
  callRecorderPreference?: string | null;
};

export const fetchCalendarEventsByFilter = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<CalendarEventRecord[]> => {
  const calendarEventNodes = await fetchAllNodes<CalendarEventNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        calendarEvents: {
          __args: {
            filter,
            first: TWENTY_PAGE_SIZE,
            ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
          },
          pageInfo: {
            hasNextPage: true,
            endCursor: true,
          },
          edges: {
            node: {
              id: true,
              title: true,
              isCanceled: true,
              startsAt: true,
              endsAt: true,
              iCalUid: true,
              conferenceLink: {
                primaryLinkUrl: true,
              },
              location: true,
              description: true,
              callRecorderPreference: true,
            },
          },
        },
      });

      return queryResult.calendarEvents as
        | ConnectionPage<CalendarEventNode>
        | undefined;
    },
  );

  return calendarEventNodes.map((calendarEvent) => ({
    id: calendarEvent.id,
    title: stripRestrictedFieldValue(calendarEvent.title ?? undefined),
    isCanceled: calendarEvent.isCanceled ?? false,
    startsAt: calendarEvent.startsAt ?? undefined,
    endsAt: calendarEvent.endsAt ?? undefined,
    iCalUid: calendarEvent.iCalUid ?? undefined,
    conferenceLinkUrl: resolveConferenceLinkUrl({
      conferenceLinkUrl: calendarEvent.conferenceLink?.primaryLinkUrl,
      location: stripRestrictedFieldValue(calendarEvent.location ?? undefined),
      description: stripRestrictedFieldValue(
        calendarEvent.description ?? undefined,
      ),
    }),
    callRecorderPreference: isString(calendarEvent.callRecorderPreference)
      ? calendarEvent.callRecorderPreference
      : undefined,
  }));
};
