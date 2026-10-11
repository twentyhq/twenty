import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ThemeProvider } from 'twenty-ui/theme';

import { MemberPermissionsTab } from '@/settings/members/components/MemberPermissionsTab';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => jest.fn(),
}));

jest.mock('@/ui/input/components/Select', () => ({
  Select: () => null,
}));

jest.mock(
  '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsObjectLevelSection',
  () => ({ SettingsRolePermissionsObjectLevelSection: () => null }),
);

jest.mock(
  '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsSection',
  () => ({ SettingsRolePermissionsSettingsSection: () => null }),
);

jest.mock(
  '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsToolSection',
  () => ({ SettingsRolePermissionsToolSection: () => null }),
);

dynamicActivate(SOURCE_LOCALE);

const ROLE_ID = '20202020-0000-4000-8000-000000000001';

const PERSISTED_ROLE: RoleWithPartialMembers = {
  __typename: 'Role',
  id: ROLE_ID,
  label: 'Member',
  description: '',
  icon: 'IconUser',
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  isEditable: true,
  workspaceMembers: [],
  agents: [],
  apiKeys: [],
  permissionFlags: [],
  objectPermissions: [],
  fieldPermissions: [],
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const MEMBER = {
  id: '20202020-0000-4000-8000-000000000002',
};

const getPermissionCheckbox = (label: string) => {
  const row = screen.getByText(label).closest<HTMLElement>('[data-table-row]');

  if (row === null) {
    throw new Error(`No permission row for "${label}"`);
  }

  return within(row).getByRole('checkbox');
};

describe('MemberPermissionsTab', () => {
  it("should show the member role's saved object permissions", async () => {
    const store = createStore();

    store.set(
      settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
      PERSISTED_ROLE,
    );

    render(
      <JotaiProvider store={store}>
        <MockedProvider>
          <ThemeProvider colorScheme="light">
            <I18nProvider i18n={i18n}>
              <MemoryRouter>
                <MemberPermissionsTab
                  member={MEMBER}
                  roles={[PERSISTED_ROLE]}
                  allRoles={[PERSISTED_ROLE]}
                />
              </MemoryRouter>
            </I18nProvider>
          </ThemeProvider>
        </MockedProvider>
      </JotaiProvider>,
    );

    await screen.findByText('See Records on All Objects');

    expect(getPermissionCheckbox('See Records on All Objects')).toBeChecked();
    expect(getPermissionCheckbox('Edit Records on All Objects')).toBeChecked();
    expect(
      getPermissionCheckbox('Delete Records on All Objects'),
    ).toBeChecked();
    expect(
      getPermissionCheckbox('Destroy Records on All Objects'),
    ).not.toBeChecked();
  });
});
