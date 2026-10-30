import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Scheduler bookkeeping read through the store, so updating it never
// re-renders the chat.
export const aiActionStatePollingState = createAtomState<{
  isFetching: boolean;
  failureCount: number;
}>({
  key: 'ai/aiActionStatePollingState',
  defaultValue: { isFetching: false, failureCount: 0 },
});
