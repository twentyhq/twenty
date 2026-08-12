import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type SlackRecordCard } from 'src/logic-functions/types/slack-record-card.type';
import { extractSlackRecordLinks } from 'src/logic-functions/utils/extract-slack-record-links';
import { fetchSlackRecordCard } from 'src/logic-functions/utils/fetch-slack-record-card';
import { getSlackFirstListMarkerIndex } from 'src/logic-functions/utils/get-slack-first-list-marker-index';

// An answer about one record leads with it and links its relations along the
// way, so the record it leads with gets the card. An answer that only reaches
// records inside a list is an enumeration: several cards would bury the list,
// so it keeps its inline links instead.
export const fetchSlackAssistantRecordCard = async ({
  client,
  responseText,
  workspaceBaseUrl,
}: {
  client: CoreApiClient;
  responseText: string;
  workspaceBaseUrl: string | undefined;
}): Promise<SlackRecordCard | undefined> => {
  const [leadRecordLink] = extractSlackRecordLinks({
    responseText,
    workspaceBaseUrl,
  });

  if (leadRecordLink === undefined) {
    if (responseText.includes('/object/')) {
      console.warn(
        `[slack] the answer links records under a base URL other than ${workspaceBaseUrl}, posting it without a card`,
      );
    }

    return undefined;
  }

  const firstListMarkerIndex = getSlackFirstListMarkerIndex(responseText);

  if (
    firstListMarkerIndex !== undefined &&
    firstListMarkerIndex < leadRecordLink.startIndex
  ) {
    console.log(
      '[slack] the answer reaches records inside a list, posting it without a card',
    );

    return undefined;
  }

  return await fetchSlackRecordCard(client, leadRecordLink);
};
