import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Pending deletions must not alter the persisted server snapshot or its hash.
export const viewPendingDeletionRequestCountByIdState = createAtomState<
  Record<string, number>
>({
  key: 'viewPendingDeletionRequestCountByIdState',
  defaultValue: {},
});
