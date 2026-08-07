import { BadRequestException } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type TransitionInboxItemInput } from 'src/engine/core-modules/inbox/dtos/transition-inbox-item.input';
import { type InboxItemTransition } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';
import { toInboxItemPayload } from 'src/engine/core-modules/inbox/utils/to-inbox-item-payload.util';

// Narrows the flat GraphQL input into the discriminated union, so everything
// downstream of the API boundary works with a transition that cannot be
// missing the fields its kind needs.
export const toInboxItemTransition = (
  input: TransitionInboxItemInput,
): InboxItemTransition => {
  switch (input.kind) {
    case 'CLAIM':
      return {
        kind: 'CLAIM',
        ...(isDefined(input.durationMinutes)
          ? { leaseDurationMinutes: input.durationMinutes }
          : {}),
      };

    case 'RELEASE':
      return { kind: 'RELEASE' };

    case 'REASSIGN':
      if (!isDefined(input.targetUserWorkspaceId)) {
        throw new BadRequestException('REASSIGN needs a target');
      }

      return {
        kind: 'REASSIGN',
        targetUserWorkspaceId: input.targetUserWorkspaceId,
      };

    case 'RESOLVE':
      if (!isDefined(input.outcome)) {
        throw new BadRequestException('RESOLVE needs an outcome');
      }

      return {
        kind: 'RESOLVE',
        outcome: input.outcome,
        ...(isDefined(input.result)
          ? { result: toInboxItemPayload(input.result) }
          : {}),
      };

    case 'CANCEL':
      return {
        kind: 'CANCEL',
        ...(isDefined(input.reason) ? { reason: input.reason } : {}),
      };

    case 'SNOOZE':
      if (!isDefined(input.durationMinutes)) {
        throw new BadRequestException('SNOOZE needs a duration');
      }

      return { kind: 'SNOOZE', durationMinutes: input.durationMinutes };

    case 'REOPEN':
      return { kind: 'REOPEN' };

    default:
      throw new BadRequestException(`Unknown transition kind ${input.kind}`);
  }
};
