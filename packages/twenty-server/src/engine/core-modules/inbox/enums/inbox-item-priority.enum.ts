import { registerEnumType } from '@nestjs/graphql';

export enum InboxItemPriority {
  NEEDS_ACTION = 'NEEDS_ACTION',
  UPDATE = 'UPDATE',
  LOW = 'LOW',
}

registerEnumType(InboxItemPriority, { name: 'InboxItemPriority' });
