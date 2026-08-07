import { registerEnumType } from '@nestjs/graphql';

// SUBJECT types keep exactly one item per subject and assignee: later events
// fold into that item. OCCURRENCE types create one item per event.
export enum InboxItemBinding {
  SUBJECT = 'SUBJECT',
  OCCURRENCE = 'OCCURRENCE',
}

registerEnumType(InboxItemBinding, { name: 'InboxItemBinding' });
