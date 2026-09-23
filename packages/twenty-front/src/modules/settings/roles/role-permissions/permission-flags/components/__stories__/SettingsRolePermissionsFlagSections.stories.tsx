import { SettingsRoleRouteGuard } from '@/settings/roles/components/SettingsRoleRouteGuard';
import { settingsPermissionFlagDefinitionsState } from '@/settings/roles/states/settingsPermissionFlagDefinitionsState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { graphql, HttpResponse } from 'msw';
import { mockedApolloClient } from '~/testing/mockedApolloClient';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection';
import { SettingsRolePermissionsToolSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsToolSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { ComponentDecorator } from 'twenty-ui/testing';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const ROLE_ID = 'role-id';
const APP_SETTINGS_FLAG = 'APP_MANAGE_CONFIGURATION';
const APP_TOOL_FLAG = 'APP_SEND_NOTIFICATION';

const permissionFlags = [
  {
    id: 'app-settings',
    applicationId: 'notification-app',
    key: APP_SETTINGS_FLAG,
    label: 'Configure notifications',
    description: 'Manage notification preferences',
    icon: 'IconSettings',
    permissionType: 'settings',
  },
  {
    id: 'app-tool',
    applicationId: 'notification-app',
    key: APP_TOOL_FLAG,
    label: 'Send notification',
    description: null,
    icon: null,
    permissionType: 'tool',
  },
  {
    id: 'standard-settings',
    applicationId: 'standard-app',
    key: PermissionFlagType.APPLICATIONS,
    label: 'Duplicate standard permission',
    description: null,
    icon: null,
    permissionType: 'settings',
  },
];

const SettingsRolePermissionsFlagSections = ({
  isEditable,
}: {
  isEditable: boolean;
  assignment: 'users' | 'agents' | 'apiKeys';
}) => (
  <>
    <section aria-label="Layout permissions">
      <SettingsRolePermissionsSettingsSection
        roleId={ROLE_ID}
        isEditable={isEditable}
      />
    </section>
    <section aria-label="Logic permissions">
      <SettingsRolePermissionsToolSection
        roleId={ROLE_ID}
        isEditable={isEditable}
      />
    </section>
  </>
);

const meta: Meta<typeof SettingsRolePermissionsFlagSections> = {
  title:
    'Modules/Settings/Roles/RolePermissions/SettingsRolePermissionsFlagSections',
  component: SettingsRolePermissionsFlagSections,
  decorators: [ComponentDecorator],
  args: { isEditable: true, assignment: 'users' },
  beforeEach: ({ args }) => {
    jotaiStore.set(
      settingsPermissionFlagDefinitionsState.atom,
      permissionFlags,
    );
    const roleAtom = settingsDraftRoleFamilyState.atomFamily(ROLE_ID);
    jotaiStore.set(roleAtom, {
      ...jotaiStore.get(roleAtom),
      id: ROLE_ID,
      canBeAssignedToUsers: args.assignment === 'users',
      canBeAssignedToAgents: args.assignment === 'agents',
      canBeAssignedToApiKeys: args.assignment === 'apiKeys',
      permissionFlags: [
        { id: 'app-tool-grant', roleId: ROLE_ID, flag: APP_TOOL_FLAG },
      ],
    });
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      installedApplications: [
        {
          id: 'notification-app',
          name: 'Notifications',
          universalIdentifier: 'notification-app',
          logoUrl: null,
        },
        {
          id: 'standard-app',
          name: 'Standard',
          universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          logoUrl: null,
        },
      ],
    });
  },
};

export default meta;
type Story = StoryObj<typeof SettingsRolePermissionsFlagSections>;

export const ForUsers: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const layout = within(
      canvas.getByRole('region', { name: 'Layout permissions' }),
    );
    const logic = within(
      canvas.getByRole('region', { name: 'Logic permissions' }),
    );
    await expect(
      await layout.findByText('Configure notifications'),
    ).toBeVisible();
    await expect(
      layout.getByText('Manage notification preferences'),
    ).toBeVisible();
    await expect(logic.getByText('Send notification')).toBeVisible();
    await expect(
      layout.queryByText('Send notification'),
    ).not.toBeInTheDocument();
    await expect(
      logic.queryByText('Configure notifications'),
    ).not.toBeInTheDocument();
    await expect(layout.getAllByText('Applications')).toHaveLength(1);
    await expect(layout.getByText('Notifications')).toBeVisible();
    await expect(logic.getByText('Notifications')).toBeVisible();
    await expect(layout.getByText('Standard')).toBeVisible();
    await expect(
      canvas.queryByText('Duplicate standard permission'),
    ).not.toBeInTheDocument();
  },
};

export const ForAgents: Story = {
  args: { assignment: 'agents' },
  play: ForUsers.play,
};
export const ForApiKeys: Story = {
  args: { assignment: 'apiKeys' },
  play: ForUsers.play,
};

export const ToggleApplicationFlags: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const layoutFlag = await canvas.findByRole('checkbox', {
      name: 'Configure notifications',
    });
    const logicFlag = canvas.getByRole('checkbox', {
      name: 'Send notification',
    });
    await expect(layoutFlag).not.toBeChecked();
    await expect(logicFlag).toBeChecked();
    await userEvent.click(layoutFlag);
    await expect(layoutFlag).toBeChecked();
    await expect(logicFlag).toBeChecked();
    await userEvent.click(layoutFlag);
    await userEvent.click(logicFlag);
    await expect(layoutFlag).not.toBeChecked();
    await expect(logicFlag).not.toBeChecked();
  },
};

export const ToggleAllLayoutFlags: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const layout = within(
      canvas.getByRole('region', { name: 'Layout permissions' }),
    );
    const appFlag = await layout.findByRole('checkbox', {
      name: 'Configure notifications',
    });
    const toggleAll = layout.getByRole('checkbox', {
      name: 'Toggle all permissions',
    });
    const logicFlag = canvas.getByRole('checkbox', {
      name: 'Send notification',
    });
    await userEvent.click(toggleAll);
    await expect(appFlag).toBeChecked();
    await expect(
      layout.getByRole('checkbox', { name: 'Applications' }),
    ).toBeChecked();
    await expect(logicFlag).toBeChecked();
    await userEvent.click(toggleAll);
    await expect(appFlag).not.toBeChecked();
    await expect(logicFlag).toBeChecked();
  },
};

export const ReadOnly: Story = {
  args: { isEditable: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const layoutFlag = await canvas.findByRole('checkbox', {
      name: 'Configure notifications',
    });
    const logicFlag = canvas.getByRole('checkbox', {
      name: 'Send notification',
    });
    await userEvent.click(layoutFlag);
    await userEvent.click(logicFlag);
    await expect(layoutFlag).not.toBeChecked();
    await expect(logicFlag).toBeChecked();
  },
};

let releaseRoles: () => void;
let rolesReady: Promise<void>;

export const InitialRolesLoading: Story = {
  render: () => (
    <SettingsRoleRouteGuard roleId={ROLE_ID}>
      <SettingsRolePermissionsFlagSections isEditable assignment="users" />
    </SettingsRoleRouteGuard>
  ),
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
    jotaiStore.set(settingsRolesIsLoadingState.atom, true);
    jotaiStore.set(settingsRoleIdsState.atom, []);
    jotaiStore.set(settingsPermissionFlagDefinitionsState.atom, []);
    rolesReady = new Promise<void>((resolve) => {
      releaseRoles = resolve;
    });
    return () => releaseRoles();
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('GetRoles', async () => {
          await rolesReady;
          return HttpResponse.json({
            data: {
              getRoles: [
                jotaiStore.get(
                  settingsDraftRoleFamilyState.atomFamily(ROLE_ID),
                ),
              ],
              getPermissionFlags: permissionFlags,
            },
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByRole('region', { name: 'Layout permissions' }),
    ).not.toBeInTheDocument();
    releaseRoles();
    await expect(
      await canvas.findByRole('checkbox', { name: 'Configure notifications' }),
    ).toBeVisible();
    const layout = within(
      canvas.getByRole('region', { name: 'Layout permissions' }),
    );
    await userEvent.click(
      layout.getByRole('checkbox', { name: 'Toggle all permissions' }),
    );
    await expect(
      layout.getByRole('checkbox', { name: 'Configure notifications' }),
    ).toBeChecked();
    await expect(
      canvas.getByRole('checkbox', { name: 'Send notification' }),
    ).toBeChecked();
  },
};
