import { registerEnumType } from '@nestjs/graphql';

export enum InboxItemPriority {
  NEEDS_ACTION = 'NEEDS_ACTION',
  UPDATE = 'UPDATE',
}

registerEnumType(InboxItemPriority, { name: 'InboxItemPriority' });
