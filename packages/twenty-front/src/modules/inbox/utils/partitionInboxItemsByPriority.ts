import { type InboxItem, InboxItemPriority } from '~/generated/graphql';

export const partitionInboxItemsByPriority = <
  TInboxItem extends Pick<InboxItem, 'priority'>,
>(
  inboxItems: TInboxItem[],
) => ({
  needsActionItems: inboxItems.filter(
    (inboxItem) => inboxItem.priority === InboxItemPriority.NEEDS_ACTION,
  ),
  otherItems: inboxItems.filter(
    (inboxItem) => inboxItem.priority !== InboxItemPriority.NEEDS_ACTION,
  ),
});
