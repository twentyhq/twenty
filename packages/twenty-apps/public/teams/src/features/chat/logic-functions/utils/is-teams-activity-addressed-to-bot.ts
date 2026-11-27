import { isDefined } from 'twenty-sdk/utils';

import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { isTeamsInstallActivity } from 'src/features/chat/logic-functions/utils/is-teams-install-activity';
import { parseTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/parse-teams-assistant-request';

export const isTeamsActivityAddressedToBot = (
  payload: TeamsActivitiesDispatchPayload,
): boolean => {
  if (isTeamsInstallActivity(payload.activity)) {
    return true;
  }

  const parsed = parseTeamsAssistantRequest(payload);

  return parsed.request !== null || isDefined(parsed.emptyRequest);
};
