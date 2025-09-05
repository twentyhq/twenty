import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { Select } from '@/ui/input/components/Select';
import { useRecoilValue } from 'recoil';
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
