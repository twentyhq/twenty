import { registerEnumType } from '@nestjs/graphql';

// Where an item currently sits. This is the only vocabulary for whether
// something is handled: the item never carries a second opinion about its
// subject's own state.
export enum InboxItemScope {
  INBOX = 'INBOX',
  SNOOZED = 'SNOOZED',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(InboxItemScope, { name: 'InboxItemScope' });
