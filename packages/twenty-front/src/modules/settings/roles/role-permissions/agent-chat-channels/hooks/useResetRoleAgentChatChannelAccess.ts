import { settingsDraftRoleAgentChatChannelIdsFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelIdsFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useResetRoleAgentChatChannelAccess = (roleId: string) => {
  const setSettingsDraftRoleAgentChatChannelIds = useSetAtomFamilyState(
    settingsDraftRoleAgentChatChannelIdsFamilyState,
    roleId,
  );

  const resetRoleAgentChatChannelAccess = () =>
    setSettingsDraftRoleAgentChatChannelIds(null);

  return { resetRoleAgentChatChannelAccess };
};
