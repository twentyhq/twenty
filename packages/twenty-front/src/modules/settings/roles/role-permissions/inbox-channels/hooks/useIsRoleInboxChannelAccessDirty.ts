import { isNonEmptyArray } from 'twenty-shared/utils';

import { useRoleInboxChannelsWithChangedAccess } from '@/settings/roles/role-permissions/inbox-channels/hooks/useRoleInboxChannelsWithChangedAccess';

export const useIsRoleInboxChannelAccessDirty = (roleId: string) => {
  const roleInboxChannelsWithChangedAccess =
    useRoleInboxChannelsWithChangedAccess(roleId);

  return isNonEmptyArray(roleInboxChannelsWithChangedAccess);
};
