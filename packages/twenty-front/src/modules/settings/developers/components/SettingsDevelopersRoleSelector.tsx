import { Select } from '@/ui/input/components/Select';
import { useIcons } from 'twenty-ui/display';
import { Role } from '~/generated-metadata/graphql';

type SettingsDevelopersRoleSelectorProps = {
  value?: string | null | undefined;
  onChange: (roleId: string) => void;
  allowEmpty?: boolean;
  label?: string;
  description?: string;
  roles: Role[];
};

export const SettingsDevelopersRoleSelector = ({
  value,
  onChange,
  allowEmpty = true,
  label,
  description,
  roles,
}: SettingsDevelopersRoleSelectorProps) => {
  const { getIcon } = useIcons();

  const options = roles.map((role) => ({
    label: role.label,
    value: role.id,
    Icon: getIcon(role.icon) ?? undefined,
  }));

  const selectValue = allowEmpty
    ? value || ''
    : value && value.trim()
      ? value
      : undefined;

  return (
    <Select
      dropdownId="role-selector"
      options={options}
      value={selectValue}
      onChange={(selectedValue) => {
        if (roles.length > 0) {
          onChange(selectedValue);
        }
      }}
      label={label}
      description={description}
      withSearchInput
      fullWidth
    />
  );
};
