import { isNonEmptyString } from '@sniptt/guards';

import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';
import { type TeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/types/teams-assistant-request-record.type';

export const isTeamsAssistantRequestResumable = (
  record: Pick<TeamsAssistantRequestRecord, 'status' | 'updatedAt'>,
  { nowMs = Date.now() }: { nowMs?: number } = {},
): boolean => {
  if (record.status === TEAMS_ASSISTANT_REQUEST_STATUS.PENDING) {
    return true;
  }

  if (
    record.status !== TEAMS_ASSISTANT_REQUEST_STATUS.PROCESSING ||
    !isNonEmptyString(record.updatedAt)
  ) {
    return false;
  }

  return (
    new Date(record.updatedAt).getTime() <
    nowMs - TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000
  );
};
