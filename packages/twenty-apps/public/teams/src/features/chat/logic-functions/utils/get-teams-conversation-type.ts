import { TEAMS_PERSONAL_CONVERSATION_TYPE } from 'src/features/chat/logic-functions/constants/teams-personal-conversation-type';
import { type TeamsInboundActivity } from 'src/features/chat/logic-functions/types/teams-inbound-activity.type';

export const getTeamsConversationType = (
  activity: Pick<TeamsInboundActivity, 'conversation'>,
): string =>
  activity.conversation?.conversationType ?? TEAMS_PERSONAL_CONVERSATION_TYPE;
