import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';

type SettingsRoleSettingsDeleteRoleConfirmationModalSubtitleProps = {
  roleId: string;
};

export const SettingsRoleSettingsDeleteRoleConfirmationModalSubtitle = ({
  roleId,
}: SettingsRoleSettingsDeleteRoleConfirmationModalSubtitleProps) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );
  const roleName = settingsDraftRole.label;

  return (
    <>{t`Confirm deletion of ${roleName} role? This cannot be undone. All members will be reassigned to the default role.`}</>
  );
};
