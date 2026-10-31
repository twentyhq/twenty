import { defineLogicFunction } from 'twenty-sdk/define';
import {
  listMessageChannels,
  reportConnectionAuthFailure,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findLinkedinConnectionByUnipileAccountId } from 'src/logic-functions/utils/find-linkedin-connection-by-unipile-account-id.util';
import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { ingestLinkedinMessages } from 'src/logic-functions/utils/ingest-linkedin-messages.util';
import { withLinkedinPublicIdentifier } from 'src/logic-functions/utils/with-linkedin-public-identifier.util';
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

  const settings = await getLinkedinSettings(connectedAccountId);

  const chat = await getUnipileChat({
    accountId: unipileAccountId,
    chatId: message.chat_id,
  });

  const chatCounterparts = getLinkedinChatCounterparts(chat);
  const counterparts =
    message.is_sender ||
    !isDefined(message.sender) ||
    chatCounterparts.some((user) => user.id === message.sender?.id)
      ? chatCounterparts
      : [...chatCounterparts, message.sender];

  const { ingestedMessageCount } = await ingestLinkedinMessages({
    unipileAccountId,
    channel,
    settings,
    chat,
    counterparts: await Promise.all(
      counterparts.map((user) =>
        withLinkedinPublicIdentifier({ unipileAccountId, user }),
      ),
    ),
    messages: [message],
  });

  if (ingestedMessageCount === 0) {
    return {
      handled: false,
      reason: 'Message carries no content or nobody in it is in Twenty',
    };
  }

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

  // Unipile also sends types the union does not list; they reach `default`.
  const eventType: string = event.type;

  switch (event.type) {
    case 'message.new':
      return ingestUnipileMessage({
        connectedAccountId: connection.id,
        unipileAccountId: event.account_id,
        message: event.payload,
      });
    case 'account.status.disconnected':
    case 'account.status.errored':
      await reportConnectionAuthFailure({
        connectionId: connection.id,
        reason: event.type,
      });

      return { handled: true };
    default:
      return { handled: false, reason: `Unhandled event ${eventType}` };
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
