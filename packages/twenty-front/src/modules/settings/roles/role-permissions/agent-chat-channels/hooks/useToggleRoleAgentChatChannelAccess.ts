import { useRoleInboxChannelIds } from '@/settings/roles/role-permissions/agent-chat-channels/hooks/useRoleAgentChatChannelIds';
import { settingsDraftRoleInboxChannelAccessFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelAccessFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useToggleRoleInboxChannelAccess = (roleId: string) => {
  const roleInboxChannelIds = useRoleInboxChannelIds(roleId);
  const setSettingsDraftRoleInboxChannelAccess = useSetAtomFamilyState(
    settingsDraftRoleInboxChannelAccessFamilyState,
    roleId,
  );

  const toggleRoleInboxChannelAccess = (channelId: string) =>
    setSettingsDraftRoleInboxChannelAccess(
      (settingsDraftRoleInboxChannelAccess) => ({
        ...settingsDraftRoleInboxChannelAccess,
        [channelId]: !roleInboxChannelIds.includes(channelId),
      }),
    );

  return { toggleRoleInboxChannelAccess };
};
