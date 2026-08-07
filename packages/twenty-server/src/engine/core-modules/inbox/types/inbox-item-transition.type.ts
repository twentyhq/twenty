import { type InboxItemPayload } from 'src/engine/core-modules/inbox/types/inbox-item-payload.type';

// Everything that can happen to an inbox item is a transition on the one
// object. Specialised mutations may wrap these for ergonomics, but nothing
// mutates an item except by naming one of these kinds.
export type InboxItemTransition =
  | { kind: 'CLAIM'; leaseDurationMinutes?: number }
  | { kind: 'RELEASE' }
  | { kind: 'REASSIGN'; targetUserWorkspaceId: string }
  | { kind: 'RESOLVE'; outcome: string; result?: InboxItemPayload }
  | { kind: 'CANCEL'; reason?: string }
  | { kind: 'SNOOZE'; durationMinutes: number }
  | { kind: 'REOPEN' };

export type InboxItemTransitionKind = InboxItemTransition['kind'];

export const INBOX_ITEM_TRANSITION_KINDS = [
  'CLAIM',
  'RELEASE',
  'REASSIGN',
  'RESOLVE',
  'CANCEL',
  'SNOOZE',
  'REOPEN',
] as const satisfies readonly InboxItemTransitionKind[];
