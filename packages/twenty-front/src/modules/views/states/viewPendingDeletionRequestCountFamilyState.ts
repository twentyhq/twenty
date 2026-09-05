import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Pending deletions must not alter the persisted server snapshot or its hash.
export const viewPendingDeletionRequestCountFamilyState = createAtomFamilyState<
  number,
  string
>({
  key: 'viewPendingDeletionRequestCountFamilyState',
  defaultValue: 0,
});
