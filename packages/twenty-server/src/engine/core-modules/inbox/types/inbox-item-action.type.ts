// An action declared by an inbox item type. The handler kind decides who runs
// it: NAVIGATE kinds are resolved by the client, the others are dispatched
// server side by InboxItemActionService.
export type InboxItemActionHandler =
  | { kind: 'OPEN_THREAD' }
  | { kind: 'OPEN_SUBJECT_RECORD' }
  | { kind: 'COMPLETE' }
  | { kind: 'SNOOZE'; durationMinutes: number };

export type InboxItemAction = {
  key: string;
  label: string;
  icon?: string;
  isPrimary?: boolean;
  handler: InboxItemActionHandler;
};

export const CLIENT_RESOLVED_ACTION_KINDS: InboxItemActionHandler['kind'][] = [
  'OPEN_THREAD',
  'OPEN_SUBJECT_RECORD',
];
