import { createState } from 'twenty-ui';

import { RoleItem } from '~/pages/settings/roles/useMockRoles';

export const roleMetadataItemsState = createState<RoleItem[]>({
  key: 'roleMetadataItemsState',
  defaultValue: [],
});
