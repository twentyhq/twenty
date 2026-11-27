import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { getString } from 'src/logic-functions/utils/get-string.util';

type CallRecordingForInbox = {
  id: string;
  calendarEventId: string | undefined;
  summaryMarkdown: string | undefined;
  createdBy: { source: string | undefined; name: string | undefined };
};

export const findCallRecordingForInbox = async ({
  client,
  callRecordingId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  callRecordingId: string;
}): Promise<CallRecordingForInbox | undefined> => {
  const queryResult = await client.query({
    callRecordings: {
      __args: {
        filter: { id: { eq: callRecordingId } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          calendarEventId: true,
          summary: { markdown: true },
          createdBy: { source: true, name: true },
        },
      },
    },
  });

  const node = queryResult.callRecordings?.edges?.[0]?.node;

  if (!isDefined(node)) {
    return undefined;
  }

  return {
    id: node.id,
    calendarEventId: getString(node.calendarEventId),
    summaryMarkdown: getString(node.summary?.markdown),
    createdBy: {
      source: getString(node.createdBy?.source),
      name: getString(node.createdBy?.name),
    },
  };
};
