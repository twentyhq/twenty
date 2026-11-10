import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { type ApplicationWithoutRelation } from '@/applications/types/ApplicationWithoutRelation';
import { SettingsRolesList } from '@/settings/roles/components/SettingsRolesList';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';

const mockInstalledApplications: Pick<
  ApplicationWithoutRelation,
  'id' | 'name' | 'defaultRoleId' | 'grantedRoleId'
>[] = [];

jest.mock('@/applications/hooks/useInstalledApplications', () => ({
  useInstalledApplications: () => mockInstalledApplications,
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => jest.fn(),
}));

jest.mock('@/settings/roles/components/SettingsRolesTableRow', () => ({
  SettingsRolesTableRow: ({ role }: { role: RoleWithPartialMembers }) => (
    <div>{role.label}</div>
  ),
}));

const buildRole = (
  overrides: Partial<RoleWithPartialMembers>,
): RoleWithPartialMembers => ({
  ...mockedRoles[1],
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  workspaceMembers: [],
  ...overrides,
});

const ADMIN_ROLE = buildRole({
  id: 'admin-role-id',
  label: 'Admin',
  canBeAssignedToUsers: true,
});

const ROLES = [
  ADMIN_ROLE,
  buildRole({ id: 'admin-grant-role-id', label: 'Twenty Standard role' }),
  buildRole({ id: 'requested-role-id', label: 'Invoicing requested' }),
  buildRole({ id: 'grant-role-id', label: 'Invoicing role' }),
  buildRole({ id: 'custom-role-id', label: 'Custom app role' }),
];

const renderList = () => {
  const store = createStore();

  store.set(
    settingsRoleIdsState.atom,
    ROLES.map((role) => role.id),
  );
  for (const role of ROLES) {
    store.set(settingsPersistedRoleFamilyState.atomFamily(role.id), role);
  }

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <SettingsRolesList />
      </JotaiProvider>
    </I18nProvider>,
  );
};

const showApplicationRoles = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Filter' }));
  await userEvent.click(
    await screen.findByRole('switch', { name: 'Application roles' }),
  );
};

describe('SettingsRolesList', () => {
  beforeEach(() => {
    // jsdom has no PointerEvent, which the filter switches dispatch on click
    window.PointerEvent ??= MouseEvent as typeof PointerEvent;
    mockInstalledApplications.splice(
      0,
      mockInstalledApplications.length,
      {
        id: 'twenty-standard-id',
        name: 'Twenty Standard',
        defaultRoleId: 'admin-role-id',
        grantedRoleId: 'admin-grant-role-id',
      },
      {
        id: 'invoicing-id',
        name: 'Invoicing',
        defaultRoleId: 'requested-role-id',
        grantedRoleId: 'grant-role-id',
      },
      {
        id: 'custom-application-id',
        name: 'Custom',
        defaultRoleId: 'custom-role-id',
        grantedRoleId: 'custom-role-id',
      },
    );
  });

  it('lists grants as application roles, behind their filter', async () => {
    renderList();

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.queryByText('Invoicing role')).not.toBeInTheDocument();

    await showApplicationRoles();

    expect(screen.getByText('Invoicing role')).toBeInTheDocument();
    expect(screen.getByText('Twenty Standard role')).toBeInTheDocument();
    expect(screen.getByText('Custom app role')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('hides roles an application only requests', async () => {
    renderList();

    await showApplicationRoles();

    expect(screen.queryByText('Invoicing requested')).not.toBeInTheDocument();
  });
});
