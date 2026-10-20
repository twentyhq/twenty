import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsRoleSettings } from '@/settings/roles/role-settings/components/SettingsRoleSettings';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const guestRole = mockedRoles[1];

const memberRole = {
  ...mockedRoles[3],
  universalIdentifier: MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
};

const SettingsRoleSettingsWrapper = (
  args: React.ComponentProps<typeof SettingsRoleSettings>,
) => {
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    args.roleId,
  );

  const role = [memberRole, ...mockedRoles].find(
    (role) => role.id === args.roleId,
  );

  if (isDefined(role)) {
    setSettingsDraftRole(role);
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
  decorators: [MemoryRouterDecorator, ComponentDecorator],
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      defaultRole: guestRole,
    });
  },
};

export default meta;
type Story = StoryObj<typeof SettingsRoleSettingsWrapper>;

export const Default: Story = {
  args: {
    roleId: mockedRoles[2].id,
    isEditable: true,
    isCreateMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: /Delete role/ }),
    ).toBeEnabled();
  },
};

export const ReadOnly: Story = {
  args: {
    roleId: mockedRoles[0].id,
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
    roleId: mockedRoles[0].id,
    isEditable: true,
    isCreateMode: true,
  },
};

export const MemberRole: Story = {
  args: {
    roleId: memberRole.id,
    isEditable: true,
    isCreateMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: /Delete role/ }),
    ).toBeDisabled();
    expect(canvas.getByText('The Member role cannot be deleted')).toBeVisible();
  },
};

export const WorkspaceDefaultRole: Story = {
  args: {
    roleId: guestRole.id,
    isEditable: true,
    isCreateMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: /Delete role/ }),
    ).toBeDisabled();
    expect(
      canvas.getByText(
        'The default role cannot be deleted. Choose another default role first',
      ),
    ).toBeVisible();
  },
};

export const RoleWithApiKeyTheDefaultRoleCannotTake: Story = {
  args: {
    roleId: mockedRoles[0].id,
    isEditable: true,
    isCreateMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByRole('button', { name: /Delete role/ }),
    ).toBeDisabled();
    expect(
      canvas.getByText(
        "The default role cannot be assigned to this role's API keys or agents. Reassign them to another role first",
      ),
    ).toBeVisible();
  },
};
