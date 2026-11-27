import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';

export type TeamsAssistantAnswerMarkers = Required<
  Pick<TeamsActivity, 'channelData'>
>;
