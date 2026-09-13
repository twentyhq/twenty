import { type InboxItemOutcome } from 'src/engine/core-modules/inbox/enums/inbox-item-outcome.enum';

// Snoozing is not a transition of its own, it is a clear that expires, which is
// why new activity wakes a snoozed item and a done one by the same comparison.
export type InboxItemTransition =
  | {
      kind: 'CLEAR';
      outcome?: InboxItemOutcome;
      resurfaceAt?: Date;
    }
  | { kind: 'REOPEN' }
  // Taking, handing over and giving back are one act with different targets.
  | {
      kind: 'ASSIGN';
      toUserWorkspaceId: string | null | typeof SELF_ASSIGNMENT;
    };

// Distinct from null, which means "nobody". The actor is only known server
// side, so the client says "me" rather than naming itself.
export const SELF_ASSIGNMENT = 'SELF';

export type InboxItemTransitionKind = InboxItemTransition['kind'];

export const INBOX_ITEM_TRANSITION_KINDS = [
  'CLEAR',
  'REOPEN',
  'ASSIGN',
] as const satisfies readonly InboxItemTransitionKind[];
