import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_MESSAGE_DELIVERY_MAX_ATTEMPTS } from 'src/logic-functions/constants/slack-message-delivery-max-attempts';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { type SlackDeliverMessagePayload } from 'src/logic-functions/types/slack-deliver-message-payload.type';
import { type SlackDeliverMessageResult } from 'src/logic-functions/types/slack-deliver-message-result.type';
import { buildSlackAnswerDeliveryFailureMessage } from 'src/logic-functions/utils/build-slack-answer-delivery-failure-message';
import { enqueueSlackMessageDelivery } from 'src/logic-functions/utils/enqueue-slack-message-delivery';
import { finishSlackAssistantRequestWithFailure } from 'src/logic-functions/utils/finish-slack-assistant-request-with-failure';
import { sendSlackMessage } from 'src/logic-functions/utils/send-slack-message';

export const slackDeliverMessageHandler = async (
  payload: SlackDeliverMessagePayload,
): Promise<SlackDeliverMessageResult> => {
  const { attempt = 1, slackAssistantRequestId, ...message } = payload;

  const result = await sendSlackMessage(message, {
    waitOutRateLimit: false,
  });

  if (result.success) {
    if (!isNonEmptyString(slackAssistantRequestId)) {
      return { delivered: true, attempt };
    }

    try {
      await updateSlackAssistantRequest(new CoreApiClient(), {
        id: slackAssistantRequestId,
        status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
        responseText: message.messageText,
      });
    } catch (error) {
      // the message is already posted, so failing the job here would risk
      // delivering it twice on any future retry
      console.warn(
        `[slack] delivered request ${slackAssistantRequestId} but could not mark it done: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return { delivered: true, attempt, statusRecorded: false };
    }

    return { delivered: true, attempt };
  }

  if (
    isDefined(result.retryAfterSeconds) &&
    attempt < SLACK_MESSAGE_DELIVERY_MAX_ATTEMPTS
  ) {
    await enqueueSlackMessageDelivery({
      payload,
      retryAfterSeconds: result.retryAfterSeconds,
    });

    return { delivered: false, attempt, rescheduled: true };
  }

  const failureMessage = buildSlackAnswerDeliveryFailureMessage(result);

  if (
    isNonEmptyString(slackAssistantRequestId) &&
    isNonEmptyString(message.parentMessageTimestamp)
  ) {
    await finishSlackAssistantRequestWithFailure({
      client: new CoreApiClient(),
      requestId: slackAssistantRequestId,
      slackChannelId: message.slackChannelId,
      parentMessageTimestamp: message.parentMessageTimestamp,
      errorMessage: failureMessage,
    });
  }

  return {
    delivered: false,
    attempt,
    rescheduled: false,
    error: failureMessage,
  };
};
