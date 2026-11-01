import { type TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';

export type TeamsAssistantRequestStatus =
  (typeof TEAMS_ASSISTANT_REQUEST_STATUS)[keyof typeof TEAMS_ASSISTANT_REQUEST_STATUS];
