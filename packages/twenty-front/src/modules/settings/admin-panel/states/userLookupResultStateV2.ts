import { type UserLookup } from '@/settings/admin-panel/types/UserLookup';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const userLookupResultStateV2 = createAtomState<UserLookup | null>({
  key: 'userLookupResultStateV2',
  defaultValue: null,
});
