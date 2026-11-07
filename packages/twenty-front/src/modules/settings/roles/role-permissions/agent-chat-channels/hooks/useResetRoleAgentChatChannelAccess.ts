import { settingsDraftRoleAgentChatChannelAccessFamilyState } from '@/settings/roles/states/settingsDraftRoleAgentChatChannelAccessFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useResetRoleAgentChatChannelAccess = (roleId: string) => {
  const setSettingsDraftRoleAgentChatChannelAccess = useSetAtomFamilyState(
    settingsDraftRoleAgentChatChannelAccessFamilyState,
    roleId,
  );

  const resetRoleAgentChatChannelAccess = () =>
    setSettingsDraftRoleAgentChatChannelAccess({});

  return { resetRoleAgentChatChannelAccess };
};
