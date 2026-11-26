import { defineLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  listMessageChannels,
  reportConnectionAuthFailure,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_DAILY_PROFILE_LOOKUP_LIMIT } from 'src/constants/linkedin-daily-profile-lookup-limit.constant';
import { LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/linkedin-attachment-deadline-margin-milliseconds.constant';
import { LINKEDIN_HANDLE_WEBHOOK_EVENT_TIMEOUT_SECONDS } from 'src/constants/linkedin-handle-webhook-event-timeout-seconds.constant';
import { LINKEDIN_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { LINKEDIN_WEBHOOK_RATE_LIMIT_RETRY_LIMIT } from 'src/constants/linkedin-webhook-rate-limit-retry-limit.constant';
import { type LinkedinWebhookEventJobPayload } from 'src/logic-functions/types/linkedin-webhook-event-job-payload.type';
import { createLinkedinCounterpartResolver } from 'src/logic-functions/utils/create-linkedin-counterpart-resolver.util';
import { findLinkedinConnectionByUnipileAccountId } from 'src/logic-functions/utils/find-linkedin-connection-by-unipile-account-id.util';
import { getLinkedinChatCounterparts } from 'src/logic-functions/utils/get-linkedin-chat-counterparts.util';
import { getLinkedinSettings } from 'src/logic-functions/utils/get-linkedin-settings.util';
import { ingestLinkedinMessages } from 'src/logic-functions/utils/ingest-linkedin-messages.util';
import { isLinkedinChatSelected } from 'src/logic-functions/utils/is-linkedin-chat-selected.util';
import { isTransientLinkedinError } from 'src/logic-functions/utils/is-transient-linkedin-error.util';
import { type UnipileMessage } from 'src/unipile/types/unipile-message.type';
import { type UnipileWebhookEvent } from 'src/unipile/types/unipile-webhook-event.type';
import { getUnipileChat } from 'src/unipile/utils/get-unipile-chat.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

type LinkedinWebhookEventResult = { handled: boolean; reason?: string };

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
}): Promise<LinkedinWebhookEventResult> => {
  const [channel] = await listMessageChannels({ connectedAccountId });

  if (!isDefined(channel)) {
    return { handled: false, reason: 'Connection has no message channel' };
  }

  const settings = await getLinkedinSettings(connectedAccountId);

  if (!isLinkedinChatSelected({ settings, chatId: message.chat_id })) {
    return { handled: false, reason: 'Conversation is not selected' };
  }

  const chat = await getUnipileChat({
    accountId: unipileAccountId,
    chatId: message.chat_id,
    deadlineAtMs: attachmentDeadlineAtMs,
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
    attachmentDeadlineAtMs,
    channel,
    settings,
    chat,
    counterparts,
    resolveCounterpart: createLinkedinCounterpartResolver(unipileAccountId, {
      dailyLookupLimit: LINKEDIN_DAILY_PROFILE_LOOKUP_LIMIT,
      deadlineAtMs: attachmentDeadlineAtMs,
    }),
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

const handleWebhookEvent = async (
  event: UnipileWebhookEvent,
): Promise<LinkedinWebhookEventResult> => {
  const attachmentDeadlineAtMs =
    Date.now() +
    LINKEDIN_HANDLE_WEBHOOK_EVENT_TIMEOUT_SECONDS * 1000 -
    LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS;
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

export const linkedinHandleWebhookEventHandler = async (
  event: LinkedinWebhookEventJobPayload,
): Promise<LinkedinWebhookEventResult> => {
  try {
    return await handleWebhookEvent(event);
  } catch (error) {
    const rateLimitRetryCount = event.rateLimitRetryCount ?? 0;

    // Queue retries all fire within seconds, before the limit resets
    if (
      error instanceof UnipileRateLimitError &&
      rateLimitRetryCount < LINKEDIN_WEBHOOK_RATE_LIMIT_RETRY_LIMIT
    ) {
      await enqueueJobs({
        logicFunctionUniversalIdentifier:
          LINKEDIN_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
        jobs: [
          {
            jobId: `linkedin-webhook-event-${event.id}-rate-limit-${rateLimitRetryCount + 1}`,
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
    if (isTransientLinkedinError(error)) {
      throw new RetryableLogicFunctionError(
        error instanceof Error ? error.message : String(error),
      );
    }

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-handle-webhook-event',
  description:
    'Imports new LinkedIn messages into the connection message channel and flags connections LinkedIn signed out.',
  timeoutSeconds: LINKEDIN_HANDLE_WEBHOOK_EVENT_TIMEOUT_SECONDS,
  handler: linkedinHandleWebhookEventHandler,
});
