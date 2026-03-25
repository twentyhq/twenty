import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { t } from '@lingui/core/macro';

type SettingsRoleSettingsDeleteRoleConfirmationModalSubtitleProps = {
  roleId: string;
};

export const SettingsRoleSettingsDeleteRoleConfirmationModalSubtitle = ({
  roleId,
}: SettingsRoleSettingsDeleteRoleConfirmationModalSubtitleProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const roleName = settingsDraftRole.label;

  return (
    <>{t`Confirm deletion of ${roleName} role? This cannot be undone. All members will be reassigned to the default role.`}</>
  );
};
