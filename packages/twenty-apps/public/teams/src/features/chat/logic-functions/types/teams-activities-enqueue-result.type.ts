import { type TeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/types/teams-assistant-request-record.type';

export type TeamsActivitiesEnqueueResult = {
  ok: boolean;
  skipped?: string;
  request?: TeamsAssistantRequestRecord;
};
