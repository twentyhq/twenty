import { SettingsRolePermissions } from '@/settings/roles/role-permissions/components/SettingsRolePermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { type Meta, type StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getRolesMock } from '~/testing/mock-data/roles';

const SettingsRolePermissionsWrapper = (
  args: React.ComponentProps<typeof SettingsRolePermissions>,
) => {
  const setDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(args.roleId),
  );

  const role = getRolesMock().find((role) => role.id === args.roleId);

  if (isDefined(role)) {
    setDraftRole(role);
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
  decorators: [RouterDecorator, ComponentDecorator, I18nFrontDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsRolePermissionsWrapper>;

export const Default: Story = {
  args: {
    roleId: '1',
    isEditable: true,
  },
};

export const ReadOnly: Story = {
  args: {
    roleId: '1',
    isEditable: false,
  },
};

export const PendingRole: Story = {
  args: {
    roleId: 'newRoleId',
    isEditable: true,
  },
};
