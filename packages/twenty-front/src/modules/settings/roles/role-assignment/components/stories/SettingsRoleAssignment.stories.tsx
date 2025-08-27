import { SettingsRoleAssignment } from '@/settings/roles/role-assignment/components/SettingsRoleAssignment';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { type Meta, type StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getRolesMock } from '~/testing/mock-data/roles';

const SettingsRoleAssignmentWrapper = (
  args: React.ComponentProps<typeof SettingsRoleAssignment>,
) => {
  const setDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(args.roleId),
  );

  const role = getRolesMock().find((role) => role.id === args.roleId);

  if (isDefined(role)) {
    setDraftRole(role);
  }

  return <SettingsRoleAssignment roleId={args.roleId} />;
};

const meta: Meta<typeof SettingsRoleAssignmentWrapper> = {
  title: 'Modules/Settings/Roles/RoleAssignment/SettingsRoleAssignment',
  component: SettingsRoleAssignmentWrapper,
  decorators: [RouterDecorator, ComponentDecorator, I18nFrontDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsRoleAssignmentWrapper>;

export const Default: Story = {
  args: {
    roleId: '1',
  },
};

export const PendingRole: Story = {
  args: {
    roleId: 'newRoleId',
  },
};
