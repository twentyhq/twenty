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
    case 'CLEAR':
      return {
        kind: 'CLEAR',
        ...(isDefined(input.outcome) ? { outcome: input.outcome } : {}),
        ...(isDefined(input.result)
          ? { result: toInboxItemPayload(input.result) }
          : {}),
        ...(isDefined(input.resurfaceInMinutes)
          ? { resurfaceInMinutes: input.resurfaceInMinutes }
          : {}),
      };

    case 'REOPEN':
      return { kind: 'REOPEN' };

    default:
      throw new BadRequestException(`Unknown transition kind ${input.kind}`);
  }
};
