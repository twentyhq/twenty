import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { type TeamsActivitiesEnqueueResult } from 'src/features/chat/logic-functions/types/teams-activities-enqueue-result.type';
import { enqueueTeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request-record';
import { isTeamsChatEnabled } from 'src/features/chat/logic-functions/utils/is-teams-chat-enabled';
import { parseTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/parse-teams-assistant-request';

export const enqueueTeamsAssistantRequest = async (
  payload: TeamsActivitiesDispatchPayload,
): Promise<TeamsActivitiesEnqueueResult> => {
  const isChatEnabled = isTeamsChatEnabled();

  if (!isChatEnabled) {
    return { ok: true, skipped: 'Chat is disabled' };
  }

  const parsed = parseTeamsAssistantRequest(payload);

  if (parsed.request === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  return await enqueueTeamsAssistantRequestRecord(parsed.request);
};
