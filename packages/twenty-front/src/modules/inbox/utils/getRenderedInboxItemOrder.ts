import { type InboxItem } from '~/generated/graphql';

// Paging has to follow what the list actually rendered. Sorting by lastEventAt
// alone would disagree with the split view, where a needs-action item shows
// above a newer one that does not need action.
export const getRenderedInboxItemOrder = ({
  inboxItems,
  needsActionItems,
  otherItems,
  shouldSplitByPriority,
}: {
  inboxItems: InboxItem[];
  needsActionItems: InboxItem[];
  otherItems: InboxItem[];
  shouldSplitByPriority: boolean;
}): InboxItem[] =>
  shouldSplitByPriority ? [...needsActionItems, ...otherItems] : inboxItems;
