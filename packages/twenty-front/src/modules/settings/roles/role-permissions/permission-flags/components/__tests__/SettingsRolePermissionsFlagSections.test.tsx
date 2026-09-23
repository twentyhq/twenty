import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { SettingsRolePermissionsSettingsSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection';
import { SettingsRolePermissionsToolSection } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsToolSection';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { ThemeProvider } from 'twenty-ui/theme-constants';
import {
  GetPermissionFlagsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const ROLE_ID = 'role-id';
const APP_SETTINGS_FLAG = 'APP_MANAGE_CONFIGURATION';
const APP_TOOL_FLAG = 'APP_SEND_NOTIFICATION';

const renderPermissionSections = ({
  isEditable = true,
  roleOverrides = {},
}: {
  isEditable?: boolean;
  roleOverrides?: Partial<RoleWithPartialMembers>;
} = {}) => {
  const store = createStore();
  const roleAtom = settingsDraftRoleFamilyState.atomFamily(ROLE_ID);

  store.set(roleAtom, {
    ...store.get(roleAtom),
    id: ROLE_ID,
    canBeAssignedToUsers: true,
    permissionFlags: [
      { id: 'app-tool-grant', roleId: ROLE_ID, flag: APP_TOOL_FLAG },
    ],
    ...roleOverrides,
  });

  store.set(currentWorkspaceState.atom, {
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

  render(
    <Provider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetPermissionFlagsDocument },
            result: {
              data: {
                getPermissionFlags: [
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
                ],
              },
            },
          },
        ]}
      >
        <ThemeProvider colorScheme="light">
          <div data-testid="settings-permissions">
            <SettingsRolePermissionsSettingsSection
              roleId={ROLE_ID}
              isEditable={isEditable}
            />
          </div>
          <div data-testid="action-permissions">
            <SettingsRolePermissionsToolSection
              roleId={ROLE_ID}
              isEditable={isEditable}
            />
          </div>
        </ThemeProvider>
      </MockedProvider>
    </Provider>,
  );

  return { getDraftRole: () => store.get(roleAtom) };
};

describe('role permission flag sections', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'PointerEvent', {
      configurable: true,
      value: MouseEvent,
    });
  });

  afterAll(() => {
    Reflect.deleteProperty(window, 'PointerEvent');
  });

  it.each(['users', 'agents', 'apiKeys'])(
    'renders application flags in their sections for roles assigned to %s',
    async (assignment) => {
      renderPermissionSections({
        roleOverrides: {
          canBeAssignedToUsers: assignment === 'users',
          canBeAssignedToAgents: assignment === 'agents',
          canBeAssignedToApiKeys: assignment === 'apiKeys',
        },
      });

      const settings = within(screen.getByTestId('settings-permissions'));
      const actions = within(screen.getByTestId('action-permissions'));

      expect(
        await settings.findByText('Configure notifications'),
      ).toBeVisible();
      expect(
        settings.getByText('Manage notification preferences'),
      ).toBeVisible();
      expect(actions.getByText('Send notification')).toBeVisible();
      expect(settings.queryByText('Send notification')).not.toBeInTheDocument();
      expect(
        actions.queryByText('Configure notifications'),
      ).not.toBeInTheDocument();
      expect(settings.getAllByText('Applications')).toHaveLength(1);
      expect(settings.getByText('Notifications')).toBeVisible();
      expect(actions.getByText('Notifications')).toBeVisible();
      expect(settings.getByText('Standard')).toBeVisible();
      expect(
        screen.queryByText('Duplicate standard permission'),
      ).not.toBeInTheDocument();
    },
  );

  it('adds and removes application flags using their custom keys', async () => {
    const user = userEvent.setup();
    const { getDraftRole } = renderPermissionSections();

    await user.click(await screen.findByText('Configure notifications'));

    expect(getDraftRole().permissionFlags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flag: APP_SETTINGS_FLAG, roleId: ROLE_ID }),
        expect.objectContaining({ flag: APP_TOOL_FLAG, id: 'app-tool-grant' }),
      ]),
    );

    await user.click(screen.getByText('Configure notifications'));
    await user.click(screen.getByText('Send notification'));

    expect(getDraftRole().permissionFlags).toEqual([]);
  });

  it('preserves other sections when selecting and clearing all settings flags', async () => {
    const user = userEvent.setup();
    const { getDraftRole } = renderPermissionSections();
    await screen.findByText('Configure notifications');

    const toggleAll = within(
      screen.getByTestId('settings-permissions'),
    ).getByRole('checkbox', { name: 'Toggle all permissions' });
    await user.click(toggleAll);

    expect(getDraftRole().permissionFlags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ flag: APP_SETTINGS_FLAG }),
        expect.objectContaining({ flag: PermissionFlagType.APPLICATIONS }),
        { flag: APP_TOOL_FLAG, id: 'app-tool-grant', roleId: ROLE_ID },
      ]),
    );

    await user.click(toggleAll);

    expect(getDraftRole().permissionFlags).toEqual([
      { flag: APP_TOOL_FLAG, id: 'app-tool-grant', roleId: ROLE_ID },
    ]);
  });

  it('does not change application flags on a read-only role', async () => {
    const user = userEvent.setup();
    const { getDraftRole } = renderPermissionSections({ isEditable: false });

    await user.click(await screen.findByText('Configure notifications'));
    await user.click(screen.getByText('Send notification'));

    expect(getDraftRole().permissionFlags).toEqual([
      { flag: APP_TOOL_FLAG, id: 'app-tool-grant', roleId: ROLE_ID },
    ]);
  });
});
