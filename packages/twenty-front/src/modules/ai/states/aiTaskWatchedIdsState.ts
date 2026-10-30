import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Mounted task cards, counted so a task shown twice is fetched once and
// stops being polled only when its last card unmounts.
export const aiTaskWatchedIdsState = createAtomState<Record<string, number>>({
  key: 'ai/aiTaskWatchedIdsState',
  defaultValue: {},
});
