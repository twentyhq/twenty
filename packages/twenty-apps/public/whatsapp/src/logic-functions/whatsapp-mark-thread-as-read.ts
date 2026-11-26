import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  getConnection,
  type MarkAppThreadAsReadPayload,
} from 'twenty-sdk/logic-function';

import { WHATSAPP_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getWhatsappSettings } from 'src/logic-functions/utils/get-whatsapp-settings.util';
import { markUnipileChatAsRead } from 'src/unipile/utils/mark-unipile-chat-as-read.util';

export const whatsappMarkThreadAsReadHandler = async ({
  connectedAccountId,
  threadExternalId,
}: MarkAppThreadAsReadPayload): Promise<void> => {
  const { areChatsMarkedAsRead } =
    await getWhatsappSettings(connectedAccountId);

  if (!areChatsMarkedAsRead) {
    return;
  }

  const connection = await getConnection(connectedAccountId);
  const unipileAccountId = connection.externalAccountId;

  if (!isNonEmptyString(unipileAccountId)) {
    throw new Error(
      `WhatsApp connection ${connectedAccountId} has no Unipile account`,
    );
  }

  await markUnipileChatAsRead({
    accountId: unipileAccountId,
    chatId: threadExternalId,
  });
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-mark-thread-as-read',
  description:
    'Marks a WhatsApp conversation opened in Twenty as read through Unipile, when the member turned it on.',
  timeoutSeconds: 15,
  handler: whatsappMarkThreadAsReadHandler,
});
