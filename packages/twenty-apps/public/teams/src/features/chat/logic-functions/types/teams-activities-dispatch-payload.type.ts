import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';

export type TeamsActivitiesDispatchPayload = {
  activity: TeamsInboundActivity;
  serviceUrl: string;
  tenantId: string;
};
