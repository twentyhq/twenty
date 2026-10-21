import { useRoleAgentChatChannelIds } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useRoleAgentChatChannelIds';
import { settingsDraftRoleAgentChatChannelIdsFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelIdsFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useToggleRoleAgentChatChannelAccess = (roleId: string) => {
  const roleAgentChatChannelIds = useRoleAgentChatChannelIds(roleId);
  const setSettingsDraftRoleAgentChatChannelIds = useSetAtomFamilyState(
    settingsDraftRoleAgentChatChannelIdsFamilyState,
    roleId,
  );

  const toggleRoleAgentChatChannelAccess = (channelId: string) =>
    setSettingsDraftRoleAgentChatChannelIds(
      roleAgentChatChannelIds.includes(channelId)
        ? roleAgentChatChannelIds.filter(
            (roleAgentChatChannelId) => roleAgentChatChannelId !== channelId,
          )
        : [...roleAgentChatChannelIds, channelId],
    );

  return { toggleRoleAgentChatChannelAccess };
};
