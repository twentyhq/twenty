import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

type InboxItemOrder = {
  // The section the order was captured from. A direct link into another
  // section must not page through a stranger's list just because its id
  // happens to still be in the snapshot.
  inboxSectionSlug: string;
  inboxItemIds: string[];
};

// Snapshotted when the focused view is entered. Reading the list live would
// let a poll or a resolution reshuffle it and send previous/next somewhere the
// user did not ask for.
export const inboxItemOrderState = createAtomState<InboxItemOrder | null>({
  key: 'inbox/inboxItemOrderState',
  defaultValue: null,
});
