import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_ACTIVITIES_ENQUEUE_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';
import { enqueueTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request';

export default defineLogicFunction({
  universalIdentifier: TEAMS_ACTIVITIES_ENQUEUE_UNIVERSAL_IDENTIFIER,
  name: 'teams-activities-enqueue',
  description:
    'Receives a verified Microsoft Teams message activity from the activities route, in the workspace that claimed its tenant. When chat is enabled, records it as a pending Teams Assistant Request, once per conversation and activity id, and hands the request back for answering.',
  timeoutSeconds: TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS,
  handler: enqueueTeamsAssistantRequest,
});
