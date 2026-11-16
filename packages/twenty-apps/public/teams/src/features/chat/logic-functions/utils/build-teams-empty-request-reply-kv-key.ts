import { type TeamsAssistantEmptyRequest } from 'src/features/chat/logic-functions/types/teams-assistant-empty-request.type';

export const buildTeamsEmptyRequestReplyKvKey = ({
  teamsConversationId,
  teamsActivityId,
}: Pick<
  TeamsAssistantEmptyRequest,
  'teamsConversationId' | 'teamsActivityId'
>): string =>
  `teams-empty-request-reply:${teamsConversationId}:${teamsActivityId}`;
