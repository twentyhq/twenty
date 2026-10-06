import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';

import { SettingsRoleRouteGuard } from '@/settings/roles/components/SettingsRoleRouteGuard';
import { SettingsRole } from '@/settings/roles/role/components/SettingsRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { RoutedFlowStateScopeContext } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';

const mockSaveDraftRoleToDB = jest.fn();
const mockLoadCurrentUser = jest.fn();
const mockEnqueueToast = jest.fn();
const mockNavigateSettings = jest.fn();

jest.mock('@/settings/roles/components/SettingsRolesQueryEffect', () => ({
  SettingsRolesQueryEffect: () => null,
}));

jest.mock('@/app/routing/components/WorkspaceRouteUnavailable', () => ({
  WorkspaceRouteUnavailable: () => <div>Role unavailable</div>,
}));

jest.mock('@/settings/roles/role/hooks/useSaveDraftRoleToDB', () => ({
  useSaveDraftRoleToDB: () => ({ saveDraftRoleToDB: mockSaveDraftRoleToDB }),
}));

jest.mock('@/users/hooks/useLoadCurrentUser', () => ({
  useLoadCurrentUser: () => ({ loadCurrentUser: mockLoadCurrentUser }),
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => mockNavigateSettings,
}));

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@/settings/components/layout/SettingsPageLayout', () => ({
  SettingsPageLayout: ({
    actionButton,
    children,
  }: {
    actionButton?: ReactNode;
    children: ReactNode;
  }) => (
    <>
      {actionButton}
      {children}
    </>
  ),
}));

jest.mock('@/settings/components/layout/SettingsTabBar', () => ({
  SettingsTabBar: () => null,
}));

jest.mock(
  '@/settings/roles/role/components/SettingsRoleLabelContainer',
  () => ({
    SettingsRoleLabelContainer: () => null,
  }),
);

jest.mock(
  '@/settings/roles/role-assignment/components/SettingsRoleAssignment',
  () => ({ SettingsRoleAssignment: () => null }),
);

jest.mock(
  '@/settings/roles/role-permissions/components/SettingsRolePermissions',
  () => ({ SettingsRolePermissions: () => null }),
);

jest.mock(
  '@/settings/roles/role-settings/components/SettingsRoleSettings',
  () => ({ SettingsRoleSettings: () => null }),
);

const ROLE_ID = 'role-id';

const PERSISTED_ROLE: RoleWithPartialMembers = {
  __typename: 'Role',
  id: ROLE_ID,
  label: 'Sales',
  description: '',
  icon: 'IconUser',
  canUpdateAllSettings: false,
  canAccessAllTools: false,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: true,
  canBeAssignedToApiKeys: true,
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

const renderSettingsRole = ({
  draftLabel,
  isCreateMode = false,
  scopeId = null,
}: {
  draftLabel: string;
  isCreateMode?: boolean;
  scopeId?: string | null;
}) => {
  const store = createStore();

  store.set(
    settingsPersistedRoleFamilyState.atomFamily(ROLE_ID),
    isCreateMode ? undefined : PERSISTED_ROLE,
  );
  store.set(settingsDraftRoleFamilyState.getAtom(ROLE_ID, scopeId), {
    ...PERSISTED_ROLE,
    label: draftLabel,
  });

  const rendered = render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <JotaiProvider store={store}>
          <RoutedFlowStateScopeContext.Provider value={scopeId}>
            <SettingsRole roleId={ROLE_ID} isCreateMode={isCreateMode} />
          </RoutedFlowStateScopeContext.Provider>
        </JotaiProvider>
      </MemoryRouter>
    </I18nProvider>,
  );

  return { ...rendered, store };
};

describe('SettingsRole', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it.each([null, 'role-creation-flow'])(
    'should prevent a canceled draft from reopening in scope %s',
    async (scopeId) => {
      const user = userEvent.setup();
      const { store, unmount } = renderSettingsRole({
        draftLabel: 'Canceled role',
        isCreateMode: true,
        scopeId,
      });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockNavigateSettings).toHaveBeenCalledTimes(1);
      expect(mockNavigateSettings).toHaveBeenCalledWith(SettingsPath.Roles);
      expect(mockSaveDraftRoleToDB).not.toHaveBeenCalled();

      unmount();
      store.set(settingsRolesIsLoadingState.atom, false);

      render(
        <JotaiProvider store={store}>
          <RoutedFlowStateScopeContext.Provider value={scopeId}>
            <SettingsRoleRouteGuard roleId={ROLE_ID}>
              <div>Role editor</div>
            </SettingsRoleRouteGuard>
          </RoutedFlowStateScopeContext.Provider>
        </JotaiProvider>,
      );

      expect(screen.getByText('Role unavailable')).toBeInTheDocument();
      expect(screen.queryByText('Role editor')).not.toBeInTheDocument();
    },
  );

  it('should restore the persisted role when canceling edits', async () => {
    const user = userEvent.setup();
    const { store } = renderSettingsRole({ draftLabel: 'Changed role' });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(store.get(settingsDraftRoleFamilyState.atomFamily(ROLE_ID))).toEqual(
      PERSISTED_ROLE,
    );
    expect(mockNavigateSettings).not.toHaveBeenCalled();
    expect(mockSaveDraftRoleToDB).not.toHaveBeenCalled();
  });

  it('should leave the save button usable when saving is rejected because the role name is empty', async () => {
    const user = userEvent.setup();

    renderSettingsRole({ draftLabel: '' });

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'error',
        children: 'Role name cannot be empty',
      }),
    );
    expect(mockSaveDraftRoleToDB).not.toHaveBeenCalled();
    expect(saveButton).toBeEnabled();
    expect(saveButton).not.toHaveAttribute('aria-busy', 'true');
  });

  it('should show the save button as loading until the role is saved', async () => {
    const user = userEvent.setup();
    let resolveSave: () => void = () => {};

    mockSaveDraftRoleToDB.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      }),
    );

    renderSettingsRole({ draftLabel: 'Sales team' });

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    expect(saveButton).toHaveAttribute('aria-busy', 'true');

    await act(async () => {
      resolveSave();
    });

    await waitFor(() => {
      expect(saveButton).not.toHaveAttribute('aria-busy', 'true');
    });
    expect(mockSaveDraftRoleToDB).toHaveBeenCalledTimes(1);
    expect(mockLoadCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('should show an error toast and leave the save button usable when the save fails', async () => {
    const user = userEvent.setup();

    mockSaveDraftRoleToDB.mockRejectedValue(new Error('Save failed'));

    renderSettingsRole({ draftLabel: 'Sales team' });

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    await waitFor(() => {
      expect(mockEnqueueToast).toHaveBeenCalledTimes(1);
    });
    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'error' }),
    );
    expect(mockLoadCurrentUser).not.toHaveBeenCalled();
    expect(saveButton).not.toHaveAttribute('aria-busy', 'true');
  });
});
