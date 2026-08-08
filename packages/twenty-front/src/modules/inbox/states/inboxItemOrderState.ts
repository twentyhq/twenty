import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// The ordered ids the focused view pages through, snapshotted when it is
// entered. Reading it live would let a poll or a resolution reshuffle the list
// underneath and send previous/next somewhere the user did not ask for.
export const inboxItemOrderState = createAtomState<string[]>({
  key: 'inbox/inboxItemOrderState',
  defaultValue: [],
});
