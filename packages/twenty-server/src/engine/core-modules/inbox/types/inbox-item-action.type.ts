// An action declared by an inbox item type. The handler kind decides who runs
// it: OPEN_THREAD and OPEN_SUBJECT_RECORD are resolved by the client, the
// others are dispatched server side by InboxItemActionService.
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
