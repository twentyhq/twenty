import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { SettingsRolesList } from '@/settings/roles/components/SettingsRolesList';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';

const mockAdminRoleId = mockedRoles[0].id;
const mockApplicationRoleId = 'application-role';

jest.mock('@/applications/hooks/useInstalledApplications', () => ({
  useInstalledApplications: () => [
    {
      id: 'standard-application',
      name: 'Twenty',
      defaultRoleId: mockAdminRoleId,
    },
    {
      id: 'custom-application',
      name: 'Custom',
      defaultRoleId: mockApplicationRoleId,
    },
  ],
}));

jest.mock('@/settings/roles/components/SettingsRolesTableRow', () => ({
  SettingsRolesTableRow: ({ role }: { role: RoleWithPartialMembers }) => (
    <div>{role.label}</div>
  ),
}));

const ROLES: RoleWithPartialMembers[] = [
  ...mockedRoles,
  {
    ...mockedRoles[1],
    id: mockApplicationRoleId,
    label: 'Workspace Custom Application',
    canBeAssignedToUsers: false,
    canBeAssignedToAgents: false,
    canBeAssignedToApiKeys: false,
    workspaceMembers: [],
  },
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
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SettingsRolesList />
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('SettingsRolesList', () => {
  it('lists a member role even when an application uses it as its default role', () => {
    renderList();

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(
      screen.queryByText('Workspace Custom Application'),
    ).not.toBeInTheDocument();
  });
});
