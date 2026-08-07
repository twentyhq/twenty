import { registerEnumType } from '@nestjs/graphql';

export enum InboxItemScope {
  // Open and not currently snoozed
  INBOX = 'INBOX',
  SNOOZED = 'SNOOZED',
  RESOLVED = 'RESOLVED',
}

registerEnumType(InboxItemScope, { name: 'InboxItemScope' });
