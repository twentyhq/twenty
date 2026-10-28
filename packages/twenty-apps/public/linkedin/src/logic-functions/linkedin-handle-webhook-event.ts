import { defineLogicFunction } from 'twenty-sdk/define';
import {
  ingestMessages,
  listMessageChannels,
  reportConnectionAuthFailure,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findLinkedinConnectionByUnipileAccountId } from 'src/logic-functions/utils/find-linkedin-connection-by-unipile-account-id.util';
import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { mapUnipileMessageToIngestMessage } from 'src/logic-functions/utils/map-unipile-message-to-ingest-message.util';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileWebhookEvent } from 'src/unipile/types/unipile-webhook-event.type';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';

type LinkedinWebhookEventResult = { handled: boolean; reason?: string };

const ingestUnipileMessage = async ({
  connectedAccountId,
  unipileAccountId,
  message,
}: {
  connectedAccountId: string;
  unipileAccountId: string;
  message: UnipileMessage;
}): Promise<LinkedinWebhookEventResult> => {
  const [channel] = await listMessageChannels({ connectedAccountId });

  if (!isDefined(channel)) {
    return { handled: false, reason: 'Connection has no message channel' };
  }

  const counterparts = message.is_sender
    ? getLinkedinChatCounterparts(
        await getUnipileChat({
          accountId: unipileAccountId,
          chatId: message.chat_id,
        }),
      )
    : [];

  const ingestMessage = mapUnipileMessageToIngestMessage({
    message,
    channelHandle: channel.handle,
    counterparts,
  });

  if (!isDefined(ingestMessage)) {
    return { handled: false, reason: 'Message carries no content' };
  }

  await ingestMessages({
    messageChannelId: channel.id,
    messages: [ingestMessage],
  });

  return { handled: true };
};

export const linkedinHandleWebhookEventHandler = async (
  event: UnipileWebhookEvent,
): Promise<LinkedinWebhookEventResult> => {
  const connection = await findLinkedinConnectionByUnipileAccountId(
    event.account_id,
  );

  if (!isDefined(connection)) {
    return { handled: false, reason: 'Unknown LinkedIn account' };
  }

  switch (event.type) {
    case 'message.new':
      return ingestUnipileMessage({
        connectedAccountId: connection.id,
        unipileAccountId: event.account_id,
        message: event.payload as UnipileMessage,
      });
    case 'account.status.disconnected':
    case 'account.status.errored':
      await reportConnectionAuthFailure({
        connectionId: connection.id,
        reason: event.type,
      });

      return { handled: true };
    default:
      return { handled: false, reason: `Unhandled event ${event.type}` };
  }
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-handle-webhook-event',
  description:
    'Imports new LinkedIn messages into the connection message channel and flags connections LinkedIn signed out.',
  timeoutSeconds: 30,
  handler: linkedinHandleWebhookEventHandler,
});
