import { type UserLookup } from '@/settings/admin-panel/types/UserLookup';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const userLookupResultStateV2 = createStateV2<UserLookup | null>({
  key: 'userLookupResultStateV2',
  defaultValue: null,
});
