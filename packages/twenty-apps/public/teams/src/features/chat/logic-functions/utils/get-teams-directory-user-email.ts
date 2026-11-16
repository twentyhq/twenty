import { isNonEmptyString } from '@sniptt/guards';

import { type LinkableGraphUser } from 'src/features/chat/logic-functions/types/graph-user.type';

// Guests invited from another tenant carry this marker in their principal
// name; userType is not readable with User.ReadBasic.All
const GUEST_USER_PRINCIPAL_NAME_MARKER = '#EXT#';

export const getTeamsDirectoryUserEmail = (
  user: LinkableGraphUser,
): string | undefined => {
  if (
    isNonEmptyString(user.userPrincipalName) &&
    user.userPrincipalName.includes(GUEST_USER_PRINCIPAL_NAME_MARKER)
  ) {
    return undefined;
  }

  return [user.mail, user.userPrincipalName].find(isNonEmptyString);
};
