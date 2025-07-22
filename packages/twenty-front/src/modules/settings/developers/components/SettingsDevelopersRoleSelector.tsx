import { Select } from '@/ui/input/components/Select';
import { t } from '@lingui/core/macro';
import { useIcons } from 'twenty-ui/display';
import { useGetRolesQuery } from '~/generated-metadata/graphql';

type SettingsDevelopersRoleSelectorProps = {
  value?: string | null | undefined;
  onChange: (roleId: string) => void;
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
  const { data: rolesData, loading: rolesLoading } = useGetRolesQuery();
  const { getIcon } = useIcons();

  const roles = rolesData?.getRoles ?? [];

  const options =
    roles.length > 0
      ? roles.map((role) => ({
          label: role.label,
          value: role.id,
          Icon: getIcon(role.icon) ?? undefined,
        }))
      : [
          {
            label: t`Loading roles...`,
            value: '',
          },
        ];

  const emptyOption = allowEmpty
    ? {
        label: t`Default role`,
        value: '',
      }
    : undefined;

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
        // Don't call onChange when loading
        if (roles.length > 0) {
          onChange(selectedValue);
        }
      }}
      emptyOption={emptyOption}
      disabled={disabled || rolesLoading}
      label={label}
      description={description}
      withSearchInput
      fullWidth
    />
  );
};
