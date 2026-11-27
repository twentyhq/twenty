import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type ConnectionPage } from 'src/logic-functions/data/fetch-all-nodes.util';
import { stripRestrictedFieldValue } from 'src/logic-functions/data/strip-restricted-field-value.util';

type CalendarEventTitleNode = {
  id: string;
  title?: string | null;
};

// Runs as the member viewing the card: the app itself cannot read the title of a meeting shared as metadata only.
export const fetchCalendarEventTitle = async ({
  client,
  calendarEventId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  calendarEventId: string;
}): Promise<string | undefined> => {
  const queryResult = await client.query({
    calendarEvents: {
      __args: { filter: { id: { eq: calendarEventId } }, first: 1 },
      edges: { node: { id: true, title: true } },
    },
  });

  const title = stripRestrictedFieldValue(
    (
      queryResult.calendarEvents as
        | ConnectionPage<CalendarEventTitleNode>
        | undefined
    )?.edges?.[0]?.node.title?.trim() ?? undefined,
  );

  return isNonEmptyString(title) ? title : undefined;
};
