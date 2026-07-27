import { Select } from '@/ui/input/components/Select';
import { type Role } from '~/generated-metadata/graphql';
import { type IconComponent, useIcons } from 'twenty-ui/icon';

type ApiKeyAssignableRole = Pick<
  Role,
  'id' | 'label' | 'icon' | 'canBeAssignedToApiKeys'
>;

type SettingsDevelopersRoleSelectorProps = {
  value?: string | null | undefined;
  onChange: (roleId: string) => void;
  label?: string;
  description?: string;
  roles: ApiKeyAssignableRole[];
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
