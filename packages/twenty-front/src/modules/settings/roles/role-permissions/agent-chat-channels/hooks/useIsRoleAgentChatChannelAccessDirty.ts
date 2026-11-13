import { isNonEmptyArray } from 'twenty-shared/utils';

import { useRoleInboxChannelsWithChangedAccess } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useRoleAgentChatChannelsWithChangedAccess';

export const useIsRoleInboxChannelAccessDirty = (roleId: string) => {
  const roleInboxChannelsWithChangedAccess =
    useRoleInboxChannelsWithChangedAccess(roleId);

  return isNonEmptyArray(roleInboxChannelsWithChangedAccess);
};
