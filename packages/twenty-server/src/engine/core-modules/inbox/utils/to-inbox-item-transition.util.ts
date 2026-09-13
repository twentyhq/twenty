import { isDefined } from 'twenty-shared/utils';

import { type TransitionInboxItemInput } from 'src/engine/core-modules/inbox/dtos/transition-inbox-item.input';
import {
  InboxException,
  InboxExceptionCode,
} from 'src/engine/core-modules/inbox/inbox.exception';
import {
  type InboxItemTransition,
  SELF_ASSIGNMENT,
} from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';

// Narrows the flat GraphQL input, so everything downstream of the API boundary
// works with a transition that cannot be missing the fields its kind needs.
export const toInboxItemTransition = (
  input: TransitionInboxItemInput,
): InboxItemTransition => {
  switch (input.kind) {
    case 'CLEAR':
      // An outcome says how the item ended; a resurfacing time says it has not.
      if (isDefined(input.outcome) && isDefined(input.resurfaceAt)) {
        throw new InboxException(
          'A clear that comes back cannot also carry an outcome',
          InboxExceptionCode.INVALID_INBOX_ACTION,
        );
      }

      return {
        kind: 'CLEAR',
        ...(isDefined(input.outcome) ? { outcome: input.outcome } : {}),
        ...(isDefined(input.resurfaceAt)
          ? { resurfaceAt: input.resurfaceAt }
          : {}),
      };

    case 'REOPEN':
      return { kind: 'REOPEN' };

    // Absent means "me", null means "nobody", an id means "them". Taking work
    // out of a queue is the common case and needs no id from the client.
    case 'ASSIGN':
      return {
        kind: 'ASSIGN',
        toUserWorkspaceId:
          'toUserWorkspaceId' in input
            ? (input.toUserWorkspaceId ?? null)
            : SELF_ASSIGNMENT,
      };

    default:
      throw new InboxException(
        `Unknown transition kind ${input.kind}`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
      );
  }
};
