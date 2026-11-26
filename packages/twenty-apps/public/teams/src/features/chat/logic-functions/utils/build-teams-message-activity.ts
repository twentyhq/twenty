import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';

// Without extendedmarkdown Teams drops fenced code blocks, tables and task lists.
export const buildTeamsMessageActivity = (
  content: Pick<TeamsActivity, 'text' | 'entities' | 'suggestedActions'>,
): TeamsActivity => ({
  type: 'message',
  textFormat: 'extendedmarkdown',
  ...content,
});
