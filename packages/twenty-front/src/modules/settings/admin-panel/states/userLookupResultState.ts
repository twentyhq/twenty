import { type UserLookup } from '@/settings/admin-panel/types/UserLookup';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const userLookupResultState = createAtomState<UserLookup | null>({
  key: 'userLookupResultState',
  defaultValue: null,
});
