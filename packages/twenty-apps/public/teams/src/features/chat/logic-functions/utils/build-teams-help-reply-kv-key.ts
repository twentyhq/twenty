import { type TeamsAssistantEmptyRequest } from 'src/features/chat/logic-functions/types/teams-assistant-empty-request.type';

export const buildTeamsHelpReplyKvKey = ({
  teamsConversationId,
  teamsActivityId,
}: Pick<
  TeamsAssistantEmptyRequest,
  'teamsConversationId' | 'teamsActivityId'
>): string => `teams-help-reply:${teamsConversationId}:${teamsActivityId}`;
