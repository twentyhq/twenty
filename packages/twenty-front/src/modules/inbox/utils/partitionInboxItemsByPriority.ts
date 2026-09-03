import { type InboxItem, InboxItemPriority } from '~/generated/graphql';

// The split the inbox renders: what still needs someone, and everything else.
export const partitionInboxItemsByPriority = (inboxItems: InboxItem[]) => ({
  needsActionItems: inboxItems.filter(
    (inboxItem) => inboxItem.priority === InboxItemPriority.NEEDS_ACTION,
  ),
  otherItems: inboxItems.filter(
    (inboxItem) => inboxItem.priority !== InboxItemPriority.NEEDS_ACTION,
  ),
});
