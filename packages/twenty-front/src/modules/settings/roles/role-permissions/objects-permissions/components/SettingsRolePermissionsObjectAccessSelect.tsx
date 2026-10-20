import { type SettingsRoleObjectAccessLevel } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRoleObjectAccessLevel';
import { getObjectAccessLevelSelectOptions } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectAccessLevelSelectOptions';
import { Select } from '@/ui/input/components/Select';

type SettingsRolePermissionsObjectAccessSelectProps = {
  dropdownId: string;
  value: SettingsRoleObjectAccessLevel;
  disabled?: boolean;
  onChange: (accessLevel: SettingsRoleObjectAccessLevel) => void;
};

export const SettingsRolePermissionsObjectAccessSelect = ({
  dropdownId,
  value,
  disabled,
  onChange,
}: SettingsRolePermissionsObjectAccessSelectProps) => (
  <Select
    selectSizeVariant="small"
    dropdownId={dropdownId}
    options={getObjectAccessLevelSelectOptions()}
    value={value}
    disabled={disabled}
    onChange={onChange}
  />
);
