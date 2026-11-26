import { isDefined } from 'twenty-sdk/utils';

import { type TeamsActivity } from 'src/features/chat/logic-functions/types/teams-activity.type';

// Without extendedmarkdown Teams drops fenced code blocks, tables and task lists.
export const buildTeamsMessageActivity = ({
  text,
  entities,
}: Pick<TeamsActivity, 'text' | 'entities'>): TeamsActivity => ({
  type: 'message',
  textFormat: 'extendedmarkdown',
  text,
  ...(isDefined(entities) ? { entities } : {}),
});
