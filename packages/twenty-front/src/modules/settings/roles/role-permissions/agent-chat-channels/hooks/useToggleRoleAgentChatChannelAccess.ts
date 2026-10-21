import { useRoleAgentChatChannelIds } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useRoleAgentChatChannelIds';
import { settingsDraftRoleAgentChatChannelAccessFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelAccessFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useToggleRoleAgentChatChannelAccess = (roleId: string) => {
  const roleAgentChatChannelIds = useRoleAgentChatChannelIds(roleId);
  const setSettingsDraftRoleAgentChatChannelAccess = useSetAtomFamilyState(
    settingsDraftRoleAgentChatChannelAccessFamilyState,
    roleId,
  );

  const toggleRoleAgentChatChannelAccess = (channelId: string) =>
    setSettingsDraftRoleAgentChatChannelAccess(
      (settingsDraftRoleAgentChatChannelAccess) => ({
        ...settingsDraftRoleAgentChatChannelAccess,
        [channelId]: !roleAgentChatChannelIds.includes(channelId),
      }),
    );

  return { toggleRoleAgentChatChannelAccess };
};
