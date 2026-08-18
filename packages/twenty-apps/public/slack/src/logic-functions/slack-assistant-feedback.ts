import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackAssistantFeedbackHandler } from 'src/logic-functions/handlers/slack-assistant-feedback-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER,
  name: 'slack-assistant-feedback',
  description:
    'Runs in the resolved workspace: stores the thumbs up / thumbs down rating a user left with the feedback buttons under an assistant answer on the matching Slack Assistant Request record.',
  timeoutSeconds: 15,
  handler: slackAssistantFeedbackHandler,
});
