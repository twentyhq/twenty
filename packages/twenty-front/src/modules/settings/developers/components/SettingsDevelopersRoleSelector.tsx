import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Select } from '@/ui/input/components/Select';
import { useRecoilValue } from 'recoil';
import { useIcons } from 'twenty-ui/display';
import { Role } from '~/generated-metadata/graphql';

type SettingsDevelopersRoleSelectorProps = {
  value?: string | null | undefined;
  onChange: (roleId: string) => void;
  label?: string;
  description?: string;
  roles: Role[];
};

export const SettingsDevelopersRoleSelector = ({
  value,
  onChange,
  label,
  description,
  roles,
}: SettingsDevelopersRoleSelectorProps) => {
  const { getIcon } = useIcons();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  let doesDefaultRoleExistInRoles = false;

  const defaultRole = currentWorkspace?.defaultRole;
  try {
    doesDefaultRoleExistInRoles = roles.some(
      (role) => role.id === defaultRole?.id,
    );
  } catch {
    throw new Error(
      'Default role does not exist in roles, this should not happen',
    );
  }

  if (roles.length === 0) {
    return null;
  }

  const options = roles.map((role) => ({
    label: role.label,
    value: role.id,
    Icon: getIcon(role.icon) ?? undefined,
  }));

  const selectValue =
    value || (doesDefaultRoleExistInRoles ? defaultRole?.id : roles[0].id);

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
