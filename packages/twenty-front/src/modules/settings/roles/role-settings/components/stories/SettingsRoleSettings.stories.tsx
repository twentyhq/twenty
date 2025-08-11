import { SettingsRoleSettings } from '@/settings/roles/role-settings/components/SettingsRoleSettings';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { type Meta, type StoryObj } from '@storybook/react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { getRolesMock } from '~/testing/mock-data/roles';

const SettingsRoleSettingsWrapper = (
  args: React.ComponentProps<typeof SettingsRoleSettings>,
) => {
  const setDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(args.roleId),
  );

  const role = getRolesMock().find((role) => role.id === args.roleId);

  if (isDefined(role)) {
    setDraftRole(role);
  }

  return (
    <SettingsRoleSettings
      roleId={args.roleId}
      isEditable={args.isEditable}
      isCreateMode={args.isCreateMode}
    />
  );
};

const meta: Meta<typeof SettingsRoleSettingsWrapper> = {
  title: 'Modules/Settings/Roles/RoleSettings/SettingsRoleSettings',
  component: SettingsRoleSettingsWrapper,
  decorators: [RouterDecorator, ComponentDecorator, I18nFrontDecorator],
};

export default meta;
type Story = StoryObj<typeof SettingsRoleSettingsWrapper>;

export const Default: Story = {
  args: {
    roleId: '1',
    isEditable: true,
    isCreateMode: false,
  },
};

export const ReadOnly: Story = {
  args: {
    roleId: '1',
    isEditable: false,
    isCreateMode: false,
  },
};

export const PendingRole: Story = {
  args: {
    roleId: 'newRoleId',
    isEditable: true,
    isCreateMode: false,
  },
};

export const CreateMode: Story = {
  args: {
    roleId: '1',
    isEditable: true,
    isCreateMode: true,
  },
};
