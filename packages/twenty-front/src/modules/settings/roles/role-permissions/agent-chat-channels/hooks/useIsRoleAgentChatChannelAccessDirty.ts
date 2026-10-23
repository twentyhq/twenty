import { isNonEmptyArray } from 'twenty-shared/utils';

import { useRoleAgentChatChannelsWithChangedAccess } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useRoleAgentChatChannelsWithChangedAccess';

export const useIsRoleAgentChatChannelAccessDirty = (roleId: string) => {
  const roleAgentChatChannelsWithChangedAccess =
    useRoleAgentChatChannelsWithChangedAccess(roleId);

  return isNonEmptyArray(roleAgentChatChannelsWithChangedAccess);
};
