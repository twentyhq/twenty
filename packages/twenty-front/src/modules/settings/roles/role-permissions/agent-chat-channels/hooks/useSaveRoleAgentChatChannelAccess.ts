import { isDefined } from 'twenty-shared/utils';

import { useUpdateInboxChannel } from '@/ai/hooks/useUpdateAgentChatChannel';
import { useResetRoleInboxChannelAccess } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useResetRoleAgentChatChannelAccess';
import { useRoleInboxChannelsWithChangedAccess } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useRoleAgentChatChannelsWithChangedAccess';

export const useSaveRoleInboxChannelAccess = (roleId: string) => {
  const roleInboxChannelsWithChangedAccess =
    useRoleInboxChannelsWithChangedAccess(roleId);
  const { resetRoleInboxChannelAccess } =
    useResetRoleInboxChannelAccess(roleId);
  const { updateAgentChatChannel } = useUpdateInboxChannel();

  const saveRoleInboxChannelAccess = async () => {
    for (const channel of roleInboxChannelsWithChangedAccess) {
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

    resetRoleInboxChannelAccess();
  };

  return { saveRoleInboxChannelAccess };
};
