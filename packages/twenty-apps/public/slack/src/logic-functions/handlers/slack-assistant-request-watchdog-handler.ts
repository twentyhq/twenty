import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_INTERRUPTED_ERROR } from 'src/logic-functions/constants/slack-assistant-interrupted-error';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_REQUEST_WATCHDOG_MAX_ATTEMPTS } from 'src/logic-functions/constants/slack-assistant-request-watchdog-max-attempts';
import { failStaleSlackAssistantRequest } from 'src/logic-functions/data/fail-stale-slack-assistant-request';
import { findSlackAssistantRequestById } from 'src/logic-functions/data/find-slack-assistant-request-by-id';
import { type SlackAssistantRequestWatchdogPayload } from 'src/logic-functions/types/slack-assistant-request-watchdog-payload.type';
import { type SlackAssistantRequestWatchdogResult } from 'src/logic-functions/types/slack-assistant-request-watchdog-result.type';
import { type SlackPostMessageInput } from 'src/logic-functions/types/slack-post-message-input.type';
import { enqueueSlackAssistantRequestWatchdog } from 'src/logic-functions/utils/enqueue-slack-assistant-request-watchdog';
import { enqueueSlackMessageDelivery } from 'src/logic-functions/utils/enqueue-slack-message-delivery';
import { getSlackAssistantFailureText } from 'src/logic-functions/utils/get-slack-assistant-failure-text';
import { getSlackAssistantParentMessageTimestamp } from 'src/logic-functions/utils/get-slack-assistant-parent-message-timestamp';
import { isSlackAssistantRequestStale } from 'src/logic-functions/utils/is-slack-assistant-request-stale';
import { resolveBestEffortSlackClient } from 'src/logic-functions/utils/resolve-best-effort-slack-client';
import { sendSlackMessage } from 'src/logic-functions/utils/send-slack-message';
import { setSlackAssistantStatus } from 'src/logic-functions/utils/set-slack-assistant-status';

export const slackAssistantRequestWatchdogHandler = async ({
  slackAssistantRequestId,
  attempt = 1,
}: SlackAssistantRequestWatchdogPayload): Promise<SlackAssistantRequestWatchdogResult> => {
  const client = new CoreApiClient();

  const record = await findSlackAssistantRequestById(
    client,
    slackAssistantRequestId,
  );

  if (!isDefined(record)) {
    return {
      failed: false,
      attempt,
      rescheduled: false,
      reason: 'Request not found',
    };
  }

  if (
    record.status !== SLACK_ASSISTANT_REQUEST_STATUS.PENDING &&
    record.status !== SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING
  ) {
    return {
      failed: false,
      attempt,
      rescheduled: false,
      reason: 'Request already finished',
    };
  }

  if (!isSlackAssistantRequestStale(record)) {
    if (attempt >= SLACK_ASSISTANT_REQUEST_WATCHDOG_MAX_ATTEMPTS) {
      return {
        failed: false,
        attempt,
        rescheduled: false,
        reason: 'Request is still being processed',
      };
    }

    await enqueueSlackAssistantRequestWatchdog({
      slackAssistantRequestId,
      attempt,
    });

    return { failed: false, attempt, rescheduled: true };
  }

  const isFailed = await failStaleSlackAssistantRequest(client, {
    id: slackAssistantRequestId,
    errorMessage: SLACK_ASSISTANT_INTERRUPTED_ERROR,
  });

  if (!isFailed) {
    return {
      failed: false,
      attempt,
      rescheduled: false,
      reason: 'Request was finished by another execution',
    };
  }

  const { slackChannelId, slackMessageTimestamp } = record;

  if (
    !isNonEmptyString(slackChannelId) ||
    !isNonEmptyString(slackMessageTimestamp)
  ) {
    return { failed: true, attempt, replied: false };
  }

  const parentMessageTimestamp = getSlackAssistantParentMessageTimestamp({
    slackThreadTimestamp: record.slackThreadTimestamp,
    slackMessageTimestamp,
  });

  const slackClient = await resolveBestEffortSlackClient(
    'assistant.threads.setStatus',
  );

  if (isDefined(slackClient)) {
    await setSlackAssistantStatus({
      client: slackClient,
      slackChannelId,
      threadTimestamp: parentMessageTimestamp,
      status: '',
    });
  }

  const interruptedMessage: SlackPostMessageInput = {
    slackChannelId,
    messageText: getSlackAssistantFailureText(
      SLACK_ASSISTANT_INTERRUPTED_ERROR,
    ),
    parentMessageTimestamp,
  };

  const deliveryResult = await sendSlackMessage(interruptedMessage, {
    waitOutRateLimit: false,
  });

  if (deliveryResult.success) {
    return { failed: true, attempt, replied: true };
  }

  if (isDefined(deliveryResult.retryAfterSeconds)) {
    await enqueueSlackMessageDelivery({
      payload: interruptedMessage,
      retryAfterSeconds: deliveryResult.retryAfterSeconds,
    });
  } else {
    console.warn(
      `[slack] request ${slackAssistantRequestId} was failed as interrupted but the reply could not be posted: ${deliveryResult.error ?? deliveryResult.message}`,
    );
  }

  return { failed: true, attempt, replied: false };
};
