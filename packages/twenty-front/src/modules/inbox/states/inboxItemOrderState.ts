import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// The order the list was showing when an item was opened from it, kept so the
// item pane can page through what the person saw.
export const inboxItemOrderState = createAtomState<{
  inboxListKey: string;
  inboxItemIds: string[];
} | null>({
  key: 'inbox/inboxItemOrderState',
  defaultValue: null,
});
