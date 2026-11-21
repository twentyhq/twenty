import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { type TeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/types/teams-assistant-request-record.type';
import { isTeamsAssistantRequestStale } from 'src/features/chat/logic-functions/utils/is-teams-assistant-request-stale';

export const isTeamsAssistantRequestResumable = (
  record: Pick<TeamsAssistantRequestRecord, 'status' | 'updatedAt'>,
  { nowMs = Date.now() }: { nowMs?: number } = {},
): boolean =>
  record.status === TEAMS_ASSISTANT_REQUEST_STATUS.PENDING ||
  (record.status === TEAMS_ASSISTANT_REQUEST_STATUS.PROCESSING &&
    isTeamsAssistantRequestStale({ updatedAt: record.updatedAt, nowMs }));
