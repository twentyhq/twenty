// Snoozing is not a transition of its own, it is a clear that expires, which is
// why new activity wakes a snoozed item and an archived one by the same
// comparison.
export type InboxItemTransition =
  | {
      kind: 'CLEAR';
      resurfaceAt?: Date;
    }
  | { kind: 'REOPEN' }
  // Taking, handing over and giving back are one act with different targets.
  | {
      kind: 'ASSIGN';
      toUserWorkspaceId: string | null | typeof SELF_ASSIGNMENT;
    }
  // Which inbox the work sits in, which is a different question from who is
  // doing it: a shared inbox item can be assigned, and a personal one can be
  // handed to a team.
  | { kind: 'MOVE'; toQueueId: string | null };

// Distinct from null, which means "nobody". The actor is only known server
// side, so the client says "me" rather than naming itself.
export const SELF_ASSIGNMENT = 'SELF';

export type InboxItemTransitionKind = InboxItemTransition['kind'];

export const INBOX_ITEM_TRANSITION_KINDS = [
  'CLEAR',
  'REOPEN',
  'ASSIGN',
  'MOVE',
] as const satisfies readonly InboxItemTransitionKind[];
