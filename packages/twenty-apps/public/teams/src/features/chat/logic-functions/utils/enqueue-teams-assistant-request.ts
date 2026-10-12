import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { type TeamsActivitiesEnqueueResult } from 'src/features/chat/logic-functions/types/teams-activities-enqueue-result.type';
import { enqueueTeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request-record';
import { parseTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/parse-teams-assistant-request';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

export const enqueueTeamsAssistantRequest = async (
  payload: TeamsActivitiesDispatchPayload,
): Promise<TeamsActivitiesEnqueueResult> => {
  const isChatEnabled = isFeatureEnabled({
    isAvailable: FEATURE_FLAGS.IS_CHAT_ASSISTANT_ENABLED,
    settingValue: process.env[CHAT_ENABLED_APPLICATION_VARIABLE_KEY],
  });

  if (!isChatEnabled) {
    return { ok: true, skipped: 'Chat is disabled' };
  }

  const parsed = parseTeamsAssistantRequest(payload);

  if (parsed.request === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  return await enqueueTeamsAssistantRequestRecord(parsed.request);
};
