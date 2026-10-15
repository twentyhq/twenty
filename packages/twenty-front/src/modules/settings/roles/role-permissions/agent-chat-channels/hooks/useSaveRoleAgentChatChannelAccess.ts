import { useAgentChatChannelActions } from '@/ai/hooks/useAgentChatChannelActions';
import { useRoleAgentChatChannelAccess } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useRoleAgentChatChannelAccess';
import { settingsDraftRoleAgentChatChannelIdsFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelIdsFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useSaveRoleAgentChatChannelAccess = (roleId: string) => {
  const { changedChannels } = useRoleAgentChatChannelAccess(roleId);
  const setSettingsDraftRoleAgentChatChannelIds = useSetAtomFamilyState(
    settingsDraftRoleAgentChatChannelIdsFamilyState,
    roleId,
  );
  const { updateAgentChatChannel } = useAgentChatChannelActions();

  const saveChannelAccess = async () => {
    for (const channel of changedChannels) {
      await updateAgentChatChannel({
        channelId: channel.id,
        input: {
          roleIds: channel.roleIds.includes(roleId)
            ? channel.roleIds.filter(
                (channelRoleId) => channelRoleId !== roleId,
              )
            : [...channel.roleIds, roleId],
        },
      });
    }

    setSettingsDraftRoleAgentChatChannelIds(null);
  };

  return {
    isChannelAccessDirty: changedChannels.length > 0,
    saveChannelAccess,
    resetChannelAccess: () => setSettingsDraftRoleAgentChatChannelIds(null),
  };
};
