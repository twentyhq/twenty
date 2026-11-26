import { TEAMS_FEEDBACK_INVOKE } from 'src/features/chat/logic-functions/constants/teams-feedback-invoke';
import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';

export const isTeamsFeedbackInvokeActivity = (
  activity: Pick<TeamsInboundActivity, 'type' | 'name' | 'value'>,
): boolean =>
  activity.type === 'invoke' &&
  activity.name === TEAMS_FEEDBACK_INVOKE.NAME &&
  activity.value?.actionName === TEAMS_FEEDBACK_INVOKE.ACTION_NAME;
