import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';

// Everything a person can do to an inbox item, which is two things: take it out
// of the inbox, or put it back. Snoozing is not a third thing, it is a clear
// that expires, which is why new activity wakes a snoozed item and a done one
// by the same comparison.
export type InboxItemTransition =
  | {
      kind: 'CLEAR';
      outcome?: string;
      result?: InboxItemPayload;
      resurfaceInMinutes?: number;
    }
  | { kind: 'REOPEN' };

export type InboxItemTransitionKind = InboxItemTransition['kind'];

export const INBOX_ITEM_TRANSITION_KINDS = [
  'CLEAR',
  'REOPEN',
] as const satisfies readonly InboxItemTransitionKind[];
