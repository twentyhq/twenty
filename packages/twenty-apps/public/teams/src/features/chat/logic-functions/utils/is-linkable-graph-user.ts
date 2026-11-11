import { isNonEmptyString } from '@sniptt/guards';

import {
  type GraphUser,
  type LinkableGraphUser,
} from 'src/features/chat/logic-functions/types/graph-user.type';

// Rooms, shared mailboxes and service principals carry neither mail nor UPN.
export const isLinkableGraphUser = (
  user: GraphUser,
): user is LinkableGraphUser =>
  isNonEmptyString(user.id) &&
  (isNonEmptyString(user.mail) || isNonEmptyString(user.userPrincipalName));
