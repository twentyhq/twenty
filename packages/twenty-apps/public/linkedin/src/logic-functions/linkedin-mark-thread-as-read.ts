import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { getConnection } from 'twenty-sdk/logic-function';

import { LINKEDIN_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { type MarkAppThreadAsReadPayload } from 'src/types/mark-app-thread-as-read-payload.type';
import { markUnipileChatAsRead } from 'src/unipile/utils/mark-unipile-chat-as-read.util';

export const linkedinMarkThreadAsReadHandler = async ({
  connectedAccountId,
  threadExternalId,
}: MarkAppThreadAsReadPayload): Promise<void> => {
  const { areChatsMarkedAsRead } =
    await getLinkedinSettings(connectedAccountId);

  if (!areChatsMarkedAsRead) {
    return;
  }

  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `LinkedIn connection ${connectedAccountId} has no Unipile account`,
    );
  }

  await markUnipileChatAsRead({
    accountId: unipileAccountId,
    chatId: threadExternalId,
  });
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-mark-thread-as-read',
  description:
    'Marks a LinkedIn conversation opened in Twenty as read through Unipile, when the member turned it on.',
  timeoutSeconds: 15,
  handler: linkedinMarkThreadAsReadHandler,
});
