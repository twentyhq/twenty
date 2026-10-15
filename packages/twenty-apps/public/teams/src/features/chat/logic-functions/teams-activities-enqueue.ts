import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_ACTIVITIES_ENQUEUE_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { TEAMS_ASSISTANT_AGENT_BUDGET_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-agent-budget-seconds';
import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { type TeamsActivitiesEnqueueResult } from 'src/features/chat/logic-functions/types/teams-activities-enqueue-result.type';
import { type TeamsAssistantAnswerResult } from 'src/features/chat/logic-functions/types/teams-assistant-answer-result.type';
import { answerTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/answer-teams-assistant-request';
import { enqueueTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request';

export const teamsActivitiesEnqueueHandler = async (
  payload: TeamsActivitiesDispatchPayload,
): Promise<TeamsActivitiesEnqueueResult | TeamsAssistantAnswerResult> => {
  const agentDeadlineAtMs =
    Date.now() + TEAMS_ASSISTANT_AGENT_BUDGET_SECONDS * 1000;

  const enqueueResult = await enqueueTeamsAssistantRequest(payload);

  if (!isDefined(enqueueResult.request)) {
    return enqueueResult;
  }

  return await answerTeamsAssistantRequest({
    request: enqueueResult.request,
    agentDeadlineAtMs,
  });
};

export default defineLogicFunction({
  universalIdentifier: TEAMS_ACTIVITIES_ENQUEUE_UNIVERSAL_IDENTIFIER,
  name: 'teams-activities-enqueue',
  description:
    'Receives a verified Microsoft Teams message activity from the activities route, in the workspace that claimed its tenant. When chat is enabled, records it as a Teams Assistant Request, once per conversation and activity id, then answers it: matches the sender to a workspace member by email, runs the Teams Assistant agent as that member and posts the answer back to the conversation.',
  timeoutSeconds: TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS,
  handler: teamsActivitiesEnqueueHandler,
});
