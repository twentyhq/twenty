import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsEditableTitle } from '@/settings/components/SettingsEditableTitle';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { t } from '@lingui/core/macro';

type SettingsRoleLabelContainerProps = {
  roleId: string;
};

export const SettingsRoleLabelContainer = ({
  roleId,
}: SettingsRoleLabelContainerProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const handleChange = (newValue: string) => {
    setSettingsDraftRole({
      ...settingsDraftRole,
      label: newValue,
    });
  };

  return (
    <SettingsEditableTitle
      instanceId="role-label-input"
      disabled={!settingsDraftRole.isEditable}
      value={settingsDraftRole.label}
      onChange={handleChange}
      placeholder={t`Role name`}
    />
  );
};
