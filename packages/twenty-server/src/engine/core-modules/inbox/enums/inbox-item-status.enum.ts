import { registerEnumType } from '@nestjs/graphql';

// Snoozing is a visibility filter carried by snoozedUntil, not a status, so a
// snoozed item stays OPEN and resurfaces without anything having to wake it up.
// An item ends either because the work was done, carrying an outcome, or
// because it stopped mattering, carrying a reason.
export enum InboxItemStatus {
  OPEN = 'OPEN',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(InboxItemStatus, { name: 'InboxItemStatus' });
