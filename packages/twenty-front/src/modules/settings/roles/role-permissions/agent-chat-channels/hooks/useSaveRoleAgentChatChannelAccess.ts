import { isDefined } from 'twenty-shared/utils';

import { useUpdateAgentChatChannel } from '@/ai/hooks/useUpdateAgentChatChannel';
import { useResetRoleAgentChatChannelAccess } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useResetRoleAgentChatChannelAccess';
import { useRoleAgentChatChannelsWithChangedAccess } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useRoleAgentChatChannelsWithChangedAccess';

export const useSaveRoleAgentChatChannelAccess = (roleId: string) => {
  const roleAgentChatChannelsWithChangedAccess =
    useRoleAgentChatChannelsWithChangedAccess(roleId);
  const { resetRoleAgentChatChannelAccess } =
    useResetRoleAgentChatChannelAccess(roleId);
  const { updateAgentChatChannel } = useUpdateAgentChatChannel();

  const saveRoleAgentChatChannelAccess = async () => {
    for (const channel of roleAgentChatChannelsWithChangedAccess) {
      const updatedChannel = await updateAgentChatChannel({
        channelId: channel.id,
        input: {
          roleIds: channel.roleIds.includes(roleId)
            ? channel.roleIds.filter(
                (channelRoleId) => channelRoleId !== roleId,
              )
            : [...channel.roleIds, roleId],
        },
      });

      if (!isDefined(updatedChannel)) {
        return;
      }
    }

    resetRoleAgentChatChannelAccess();
  };

  return { saveRoleAgentChatChannelAccess };
};
