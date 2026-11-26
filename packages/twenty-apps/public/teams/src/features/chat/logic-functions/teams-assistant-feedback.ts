import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { teamsAssistantFeedbackHandler } from 'src/features/chat/logic-functions/handlers/teams-assistant-feedback-handler';

export default defineLogicFunction({
  universalIdentifier: TEAMS_ASSISTANT_FEEDBACK_UNIVERSAL_IDENTIFIER,
  name: 'teams-assistant-feedback',
  description:
    'Receives a verified Microsoft Teams feedback invoke from the activities route, in the workspace that claimed its tenant. Stores the thumbs up or thumbs down rating and the optional comment on the Teams Assistant Request whose answer was rated, when the feedback comes from the member who made the request.',
  timeoutSeconds: 15,
  handler: teamsAssistantFeedbackHandler,
});
