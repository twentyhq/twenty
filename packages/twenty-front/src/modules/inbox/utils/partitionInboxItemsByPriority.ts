import { type InboxItem, InboxItemPriority } from '~/generated/graphql';

export const partitionInboxItemsByPriority = (inboxItems: InboxItem[]) => ({
  needsActionItems: inboxItems.filter(
    (inboxItem) => inboxItem.priority === InboxItemPriority.NEEDS_ACTION,
  ),
  otherItems: inboxItems.filter(
    (inboxItem) => inboxItem.priority !== InboxItemPriority.NEEDS_ACTION,
  ),
});
