import { type UserLookup } from '@/settings/admin-panel/types/UserLookup';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const userLookupResultStateV2 = createState<UserLookup | null>({
  key: 'userLookupResultStateV2',
  defaultValue: null,
});
