import { defineLogicFunction } from 'twenty-sdk/define';
import { type MarkAppThreadAsReadPayload } from 'twenty-sdk/logic-function';

import { MESSENGER_LOGIC_FUNCTION_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findMessageChannelOrThrow } from 'src/logic-functions/data/find-message-channel-or-throw.util';
import { getPageAccessTokenOrThrow } from 'src/logic-functions/data/get-page-access-token-or-throw.util';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';

const handler = async ({
  connectedAccountId,
  messageChannelId,
  threadExternalId,
}: MarkAppThreadAsReadPayload): Promise<void> => {
  const { handle: pageId } = await findMessageChannelOrThrow({
    connectedAccountId,
    messageChannelId,
  });

  // a sender action request may carry only the recipient and the action
  await graphApiRequest({
    accessToken: await getPageAccessTokenOrThrow({ connectedAccountId, pageId }),
    method: 'POST',
    path: `${pageId}/messages`,
    data: {
      recipient: { id: threadExternalId },
      sender_action: 'mark_seen',
    },
  });
};

export default defineLogicFunction({
  universalIdentifier:
    MESSENGER_LOGIC_FUNCTION_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  name: 'mark-thread-as-read',
  description:
    'Marks a Messenger conversation opened in Twenty as seen, so the customer sees it was read',
  timeoutSeconds: 15,
  handler,
});
