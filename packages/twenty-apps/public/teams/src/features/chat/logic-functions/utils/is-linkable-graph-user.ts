import { isNonEmptyString } from '@sniptt/guards';

import {
  type GraphUser,
  type LinkableGraphUser,
} from 'src/features/chat/logic-functions/types/graph-user.type';

// A directory entry only resolves on a future message through its mail or UPN,
// so one carrying neither (rooms, shared mailboxes, service principals) is not
// linkable.
export const isLinkableGraphUser = (
  user: GraphUser,
): user is LinkableGraphUser =>
  isNonEmptyString(user.id) &&
  (isNonEmptyString(user.mail) || isNonEmptyString(user.userPrincipalName));
