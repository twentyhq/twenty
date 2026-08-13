import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_FEEDBACK_ACTION_ID } from 'src/logic-functions/constants/slack-assistant-feedback-action-id';
import { updateSlackAssistantRequestFeedback } from 'src/logic-functions/data/update-slack-assistant-request-feedback';
import { type SlackInteractivityPayload } from 'src/logic-functions/types/slack-interactivity-payload.type';
import { parseSlackAssistantFeedbackRating } from 'src/logic-functions/utils/parse-slack-assistant-feedback-rating';

export const slackAssistantFeedbackHandler = async (
  payload: SlackInteractivityPayload,
): Promise<object> => {
  const feedbackAction = payload.actions?.find(
    (action) => action.action_id === SLACK_ASSISTANT_FEEDBACK_ACTION_ID,
  );

  if (!isDefined(feedbackAction)) {
    return { skipped: true, reason: 'No assistant feedback action in payload' };
  }

  // The answer blocks carry the request record id as the block_id.
  const requestId = feedbackAction.block_id;

  if (!isNonEmptyString(requestId)) {
    return { skipped: true, reason: 'Feedback action has no request id' };
  }

  const feedbackRating = parseSlackAssistantFeedbackRating(
    feedbackAction.value,
  );

  if (!isDefined(feedbackRating)) {
    return {
      skipped: true,
      reason: `Unknown feedback button value: ${feedbackAction.value}`,
    };
  }

  await updateSlackAssistantRequestFeedback(new CoreApiClient(), {
    id: requestId,
    feedbackRating,
  });

  return { done: true };
};

export default defineLogicFunction({
  universalIdentifier: SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-feedback',
  description:
    'Runs in the resolved workspace: stores the thumbs up / thumbs down rating a user left with the feedback buttons under an assistant answer on the matching Slack Assistant Request record.',
  timeoutSeconds: 15,
  handler: slackAssistantFeedbackHandler,
});
