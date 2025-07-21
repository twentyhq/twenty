import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { useIcons } from 'twenty-ui/display';
import { useGetRolesQuery } from '~/generated-metadata/graphql';

type SettingsDevelopersRoleSelectorProps = {
  value?: string | null;
  onChange: (roleId: string | null) => void;
  allowEmpty?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
};

export const SettingsDevelopersRoleSelector = ({
  value,
  onChange,
  allowEmpty = true,
  disabled = false,
  label,
  description,
}: SettingsDevelopersRoleSelectorProps) => {
  const { data: rolesData } = useGetRolesQuery();
  const { getIcon } = useIcons();

  const roles = rolesData?.getRoles ?? [];

  const options = roles.map((role) => ({
    label: role.label,
    value: role.id,
    Icon: getIcon(role.icon) ?? undefined,
  }));

  const emptyOption = allowEmpty
    ? {
        label: t`Default role`,
        value: '',
      }
    : undefined;

  return (
    <Select
      dropdownId="role-selector"
      options={options}
      value={value || ''}
      onChange={(selectedValue) => {
        onChange(selectedValue === '' ? null : selectedValue);
      }}
      emptyOption={emptyOption}
      disabled={disabled}
      label={label}
      description={description}
      withSearchInput
      fullWidth
    />
  );
};
