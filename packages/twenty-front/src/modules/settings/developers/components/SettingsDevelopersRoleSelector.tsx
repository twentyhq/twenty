import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { Select } from '@/ui/input/components/Select';
import { type IconComponent, useIcons } from 'twenty-ui/display';

type SettingsDevelopersRoleSelectorProps = {
  value?: string | null | undefined;
  onChange: (roleId: string) => void;
  label?: string;
  description?: string;
  roles: RoleWithPartialMembers[];
};

export const SettingsDevelopersRoleSelector = ({
  value,
  onChange,
  label,
  description,
  roles,
}: SettingsDevelopersRoleSelectorProps) => {
  const { getIcon } = useIcons();

  if (roles.length === 0) {
    return null;
  }

  const options = roles.reduce<
    Array<{ label: string; value: string; Icon?: IconComponent }>
  >((acc, role) => {
    {
      if (role.canBeAssignedToApiKeys) {
        acc.push({
          label: role.label,
          value: role.id,
          Icon: getIcon(role.icon) ?? undefined,
        });
      }
      return acc;
    }
  }, []);

  const selectValue = value || options[0]?.value;

  return (
    <Select
      dropdownId="role-selector"
      options={options}
      value={selectValue}
      onChange={onChange}
      label={label}
      description={description}
      withSearchInput
      fullWidth
    />
  );
};
