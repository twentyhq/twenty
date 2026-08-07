import { registerEnumType } from '@nestjs/graphql';

// Snoozing is a visibility filter carried by snoozedUntil, not a status, so a
// snoozed item stays OPEN and resurfaces without anything having to wake it up.
export enum InboxItemStatus {
  OPEN = 'OPEN',
  DONE = 'DONE',
  DISMISSED = 'DISMISSED',
}

registerEnumType(InboxItemStatus, { name: 'InboxItemStatus' });
