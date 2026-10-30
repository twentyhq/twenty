import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Mounted review cards, counted so the same action shown twice is fetched
// once and stops being polled only when its last card unmounts.
export const aiActionWatchedIdsState = createAtomState<Record<string, number>>({
  key: 'ai/aiActionWatchedIdsState',
  defaultValue: {},
});
