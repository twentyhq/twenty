import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';

// An execution cannot outlive its timeout, so a PROCESSING record untouched
// for longer than that has no live owner and can be taken over.
export const getTeamsAssistantRequestLeaseCutoff = (
  nowMs: number = Date.now(),
): Date => new Date(nowMs - TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000);
