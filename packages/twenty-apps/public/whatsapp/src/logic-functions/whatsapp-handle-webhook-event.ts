import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  listMessageChannels,
  reportConnectionAuthFailure,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/whatsapp-attachment-deadline-margin-milliseconds.constant';
import { WHATSAPP_HANDLE_WEBHOOK_EVENT_TIMEOUT_SECONDS } from 'src/constants/whatsapp-handle-webhook-event-timeout-seconds.constant';
import { WHATSAPP_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { WHATSAPP_WEBHOOK_RATE_LIMIT_RETRY_LIMIT } from 'src/constants/whatsapp-webhook-rate-limit-retry-limit.constant';
import { type WhatsappIngestResult } from 'src/logic-functions/types/whatsapp-ingest-result.type';
import { type WhatsappWebhookEventJobPayload } from 'src/logic-functions/types/whatsapp-webhook-event-job-payload.type';
import { findWhatsappConnectionByUnipileAccountId } from 'src/logic-functions/utils/find-whatsapp-connection-by-unipile-account-id.util';
import { getWhatsappChatCounterparts } from 'src/logic-functions/utils/get-whatsapp-chat-counterparts.util';
import { getWhatsappSettings } from 'src/logic-functions/utils/get-whatsapp-settings.util';
import { ingestWhatsappMessages } from 'src/logic-functions/utils/ingest-whatsapp-messages.util';
import { isTransientWhatsappError } from 'src/logic-functions/utils/is-transient-whatsapp-error.util';
import { isWhatsappChatSelected } from 'src/logic-functions/utils/is-whatsapp-chat-selected.util';
import { withWhatsappGroupParticipants } from 'src/logic-functions/utils/with-whatsapp-group-participants.util';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileWebhookEvent } from 'src/unipile/types/unipile-webhook-event.type';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

type WhatsappWebhookEventResult = { handled: boolean; reason?: string };

const NOT_IMPORTED_REASON_BY_SKIPPED_REASON: Record<
  NonNullable<WhatsappIngestResult['skippedReason']>,
  string
> = {
  NOT_SELECTED: 'Conversation is not selected',
  GROUP_CHATS_OFF: 'Group chats are not imported',
  NO_MESSAGES: 'Message carries no content',
  NO_PHONE: 'WhatsApp hides the phone number of the people in this chat',
  NO_CONTACT: 'Nobody in this chat is in Twenty',
};

const ingestUnipileMessage = async ({
  connectedAccountId,
  unipileAccountId,
  message,
  attachmentDeadlineAtMs,
}: {
  connectedAccountId: string;
  unipileAccountId: string;
  message: UnipileMessage;
  attachmentDeadlineAtMs: number;
}): Promise<WhatsappWebhookEventResult> => {
  const [channel] = await listMessageChannels({ connectedAccountId });

  if (!isDefined(channel)) {
    return { handled: false, reason: 'Connection has no message channel' };
  }

  const settings = await getWhatsappSettings(connectedAccountId);

  if (!isWhatsappChatSelected({ settings, chatId: message.chat_id })) {
    return { handled: false, reason: 'Conversation is not selected' };
  }

  const chat = await withWhatsappGroupParticipants({
    unipileAccountId,
    chat: await getUnipileChat({
      accountId: unipileAccountId,
      chatId: message.chat_id,
      deadlineAtMs: attachmentDeadlineAtMs,
    }),
    deadlineAtMs: attachmentDeadlineAtMs,
  });

  const chatCounterparts = getWhatsappChatCounterparts(chat);
  const counterparts =
    message.is_sender ||
    !isDefined(message.sender) ||
    chatCounterparts.some((user) => user.id === message.sender?.id)
      ? chatCounterparts
      : [...chatCounterparts, message.sender];

  const { ingestedMessageCount, skippedReason } = await ingestWhatsappMessages({
    unipileAccountId,
    attachmentDeadlineAtMs,
    channel,
    settings,
    chat,
    counterparts,
    messages: [message],
  });

  if (ingestedMessageCount === 0) {
    return {
      handled: false,
      reason:
        NOT_IMPORTED_REASON_BY_SKIPPED_REASON[skippedReason ?? 'NO_MESSAGES'],
    };
  }

  return { handled: true };
};

const handleWebhookEvent = async (
  event: UnipileWebhookEvent,
): Promise<WhatsappWebhookEventResult> => {
  const attachmentDeadlineAtMs =
    Date.now() +
    WHATSAPP_HANDLE_WEBHOOK_EVENT_TIMEOUT_SECONDS * 1000 -
    WHATSAPP_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS;
  const connection = await findWhatsappConnectionByUnipileAccountId(
    event.account_id,
  );

  if (!isDefined(connection)) {
    return { handled: false, reason: 'Unknown WhatsApp account' };
  }

  // Unipile also sends types the union does not list; they reach `default`.
  const eventType: string = event.type;

  switch (event.type) {
    case 'message.new':
      return ingestUnipileMessage({
        connectedAccountId: connection.id,
        unipileAccountId: event.account_id,
        message: event.payload,
        attachmentDeadlineAtMs,
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

export const whatsappHandleWebhookEventHandler = async (
  event: WhatsappWebhookEventJobPayload,
): Promise<WhatsappWebhookEventResult> => {
  try {
    const result = await handleWebhookEvent(event);

    if (!result.handled) {
      console.log(
        `[whatsapp] event ${event.id} (${event.type}) not handled: ${result.reason}`,
      );
    }

    return result;
  } catch (error) {
    const rateLimitRetryCount = event.rateLimitRetryCount ?? 0;

    // Queue retries all fire within seconds, before the limit resets
    if (
      error instanceof UnipileRateLimitError &&
      rateLimitRetryCount < WHATSAPP_WEBHOOK_RATE_LIMIT_RETRY_LIMIT
    ) {
      await enqueueJobs({
        logicFunctionUniversalIdentifier:
          WHATSAPP_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
        jobs: [
          {
            jobId: `whatsapp-webhook-event-${event.id}-rate-limit-${rateLimitRetryCount + 1}`,
            payload: {
              ...event,
              rateLimitRetryCount: rateLimitRetryCount + 1,
            },
          },
        ],
        delayMs: error.retryAfterSeconds * 1000,
      });

      return {
        handled: false,
        reason: `Rate limited, retried in ${error.retryAfterSeconds}s`,
      };
    }

    // Unipile already got its 200 and will not redeliver: only this error type gets the job retried
    if (isTransientWhatsappError(error)) {
      throw new RetryableLogicFunctionError(
        error instanceof Error ? error.message : String(error),
      );
    }

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-handle-webhook-event',
  description:
    'Imports new WhatsApp messages into the connection message channel and flags connections unlinked from the phone.',
  timeoutSeconds: WHATSAPP_HANDLE_WEBHOOK_EVENT_TIMEOUT_SECONDS,
  handler: whatsappHandleWebhookEventHandler,
});
