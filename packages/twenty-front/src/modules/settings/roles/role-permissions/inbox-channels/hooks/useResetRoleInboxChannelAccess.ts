import { settingsDraftRoleInboxChannelAccessFamilyState } from '@/settings/roles/states/settingsDraftRoleInboxChannelAccessFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const useResetRoleInboxChannelAccess = (roleId: string) => {
  const setSettingsDraftRoleInboxChannelAccess = useSetAtomFamilyState(
    settingsDraftRoleInboxChannelAccessFamilyState,
    roleId,
  );

  const resetRoleInboxChannelAccess = () =>
    setSettingsDraftRoleInboxChannelAccess({});

  return { resetRoleInboxChannelAccess };
};
