import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { DEFAULT_OPEN_RECORD_IN_PREFERENCE } from '@/object-record/record-index/constants/DefaultOpenRecordInPreference';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type OpenRecordIn } from 'twenty-shared/types';

// Narrowed so chips don't re-render on unrelated member changes.
export const openRecordInPreferenceState = createAtomSelector<OpenRecordIn>({
  key: 'openRecordInPreferenceState',
  get: ({ get }) =>
    get(currentWorkspaceMemberState)?.openRecordIn ??
    DEFAULT_OPEN_RECORD_IN_PREFERENCE,
});
