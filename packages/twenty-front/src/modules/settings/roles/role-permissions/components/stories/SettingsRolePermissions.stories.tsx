import { SettingsRolePermissions } from '@/settings/roles/role-permissions/components/SettingsRolePermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';

const SettingsRolePermissionsWrapper = (
  args: React.ComponentProps<typeof SettingsRolePermissions>,
) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    args.roleId,
  );

  const role = mockedRoles.find((role) => role.id === args.roleId);

  if (isDefined(role)) {
    setSettingsDraftRole(role);
  }

  return (
    <SettingsRolePermissions
      roleId={args.roleId}
      isEditable={args.isEditable}
    />
  );
};

const meta: Meta<typeof SettingsRolePermissionsWrapper> = {
  title: 'Modules/Settings/Roles/RolePermissions/SettingsRolePermissions',
  component: SettingsRolePermissionsWrapper,
  decorators: [RouterDecorator, ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsRolePermissionsWrapper>;

export const Default: Story = {
  args: {
    roleId: mockedRoles[0].id,
    isEditable: true,
  },
};

export const ReadOnly: Story = {
  args: {
    roleId: mockedRoles[0].id,
    isEditable: false,
  },
};

export const PendingRole: Story = {
  args: {
    roleId: 'newRoleId',
    isEditable: true,
  },
};
