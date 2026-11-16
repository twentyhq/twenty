import { isNonEmptyString } from '@sniptt/guards';

import { type LinkableGraphUser } from 'src/features/chat/logic-functions/types/graph-user.type';

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
