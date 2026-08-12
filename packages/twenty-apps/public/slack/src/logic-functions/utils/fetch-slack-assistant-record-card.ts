import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackRecordCard } from 'src/logic-functions/types/slack-record-card.type';
import { extractSlackRecordLinks } from 'src/logic-functions/utils/extract-slack-record-links';
import { fetchSlackRecordCard } from 'src/logic-functions/utils/fetch-slack-record-card';

// A single record gets a preview card; several records would stack into a wall
// of cards, so the answer keeps its inline links instead.
export const fetchSlackAssistantRecordCard = async ({
  client,
  responseText,
  workspaceBaseUrl,
}: {
  client: CoreApiClient;
  responseText: string;
  workspaceBaseUrl: string | undefined;
}): Promise<SlackRecordCard | undefined> => {
  const recordLinks = extractSlackRecordLinks({
    responseText,
    workspaceBaseUrl,
  });

  const [singleRecordLink] = recordLinks;

  if (recordLinks.length !== 1 || singleRecordLink === undefined) {
    return undefined;
  }

  return await fetchSlackRecordCard(client, singleRecordLink);
};
