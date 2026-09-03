import { partitionInboxItemsByPriority } from '@/inbox/utils/partitionInboxItemsByPriority';
import { type InboxItem } from '~/generated/graphql';

// Paging has to follow what the list actually rendered. Sorting by lastEventAt
// alone would disagree with the split view, where a needs-action item shows
// above a newer one that does not need action.
export const getRenderedInboxItemOrder = ({
  inboxItems,
  shouldSplitByPriority,
}: {
  inboxItems: InboxItem[];
  shouldSplitByPriority: boolean;
}): InboxItem[] => {
  if (!shouldSplitByPriority) {
    return inboxItems;
  }

  const { needsActionItems, otherItems } =
    partitionInboxItemsByPriority(inboxItems);

  return [...needsActionItems, ...otherItems];
};
