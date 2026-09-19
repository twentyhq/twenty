import { isUndefined } from '@sniptt/guards';

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
      return {
        kind: 'CLEAR',
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
        toUserWorkspaceId: isUndefined(input.toUserWorkspaceId)
          ? SELF_ASSIGNMENT
          : input.toUserWorkspaceId,
      };

    // Unlike an assignment, an absent target is not "me": there is no such
    // thing as a default inbox to move to, so it has to be said.
    case 'MOVE':
      if (isUndefined(input.toQueueId)) {
        throw new InboxException(
          'A move has to name the inbox it is moving to, or null for none',
          InboxExceptionCode.INVALID_INBOX_ACTION,
        );
      }

      return { kind: 'MOVE', toQueueId: input.toQueueId };

    default:
      throw new InboxException(
        `Unknown transition kind ${input.kind}`,
        InboxExceptionCode.INVALID_INBOX_ACTION,
      );
  }
};
