import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';

export const getTeamsAssistantRequestLeaseCutoff = (
  nowMs: number = Date.now(),
): Date => new Date(nowMs - TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000);
