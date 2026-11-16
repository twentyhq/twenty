import { isNonEmptyString } from '@sniptt/guards';

import { type LinkableGraphUser } from 'src/features/chat/logic-functions/types/graph-user.type';
import { type TeamsUserSearchOption } from 'src/features/chat/logic-functions/types/teams-user-search-option.type';

export const toTeamsUserSearchOption = (
  user: LinkableGraphUser,
): TeamsUserSearchOption => ({
  teamsUserAadObjectId: user.id,
  displayName: isNonEmptyString(user.displayName)
    ? user.displayName
    : undefined,
  email: isNonEmptyString(user.mail) ? user.mail : user.userPrincipalName,
});
