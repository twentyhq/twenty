import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';

export const isTeamsInstallActivity = (
  activity: Pick<TeamsInboundActivity, 'type' | 'action'>,
): boolean =>
  activity.type === 'installationUpdate' && activity.action === 'add';
