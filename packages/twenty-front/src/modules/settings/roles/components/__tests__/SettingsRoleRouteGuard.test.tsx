import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { SettingsRoleRouteGuard } from '@/settings/roles/components/SettingsRoleRouteGuard';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { RoutedFlowStateScopeContext } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';
import {
  WorkspaceSurfaceContext,
  type WorkspaceSurfaceContextValue,
} from '@/ui/layout/contexts/WorkspaceSurfaceContext';

jest.mock('@/settings/roles/components/SettingsRolesQueryEffect', () => ({
  SettingsRolesQueryEffect: () => null,
}));

jest.mock('@/ui/layout/page/components/WorkspaceRouteUnavailable', () => ({
  WorkspaceRouteUnavailable: () => <div data-testid="route-unavailable" />,
}));

const renderGuard = ({
  surface,
  roleIds,
  draftRole,
  persistedRole,
  draftScopeId,
}: {
  surface: WorkspaceSurfaceContextValue['type'];
  roleIds: string[];
  draftRole?: RoleWithPartialMembers;
  persistedRole?: RoleWithPartialMembers;
  draftScopeId?: string;
}) => {
  const store = createStore();
  const scopeId = surface === 'side-panel' ? 'role-creation-flow' : null;

  store.set(settingsRoleIdsState.atom, roleIds);
  store.set(settingsRolesIsLoadingState.atom, false);
  if (draftRole) {
    store.set(
      settingsDraftRoleFamilyState.getAtom('role-1', draftScopeId ?? scopeId),
      draftRole,
    );
  }
  store.set(
    settingsPersistedRoleFamilyState.atomFamily('role-1'),
    persistedRole,
  );

  render(
    <JotaiProvider store={store}>
      <WorkspaceSurfaceContext.Provider
        value={{
          type: surface,
          instanceId: `${surface}-surface`,
          ownsRouteLocation: true,
        }}
      >
        <RoutedFlowStateScopeContext.Provider value={scopeId}>
          <SettingsRoleRouteGuard roleId="role-1">
            <div data-testid="role-page" />
          </SettingsRoleRouteGuard>
        </RoutedFlowStateScopeContext.Provider>
      </WorkspaceSurfaceContext.Provider>
    </JotaiProvider>,
  );
};

describe('SettingsRoleRouteGuard', () => {
  it.each(['main', 'side-panel'] as const)(
    'allows an unsaved role to reach its permission editor on %s',
    (surface) => {
      renderGuard({
        surface,
        roleIds: [],
        draftRole: { ...mockedRoles[0], id: 'role-1' },
      });

      expect(screen.getByTestId('role-page')).toBeInTheDocument();
      expect(screen.queryByTestId('route-unavailable')).not.toBeInTheDocument();
    },
  );

  it('does not use a stale draft to reopen a previously persisted role', () => {
    const role = { ...mockedRoles[0], id: 'role-1' };

    renderGuard({
      surface: 'main',
      roleIds: [],
      draftRole: role,
      persistedRole: role,
    });

    expect(screen.getByTestId('route-unavailable')).toBeInTheDocument();
  });

  it('does not allow a draft from another creation flow', () => {
    renderGuard({
      surface: 'side-panel',
      roleIds: [],
      draftRole: { ...mockedRoles[0], id: 'role-1' },
      draftScopeId: 'another-flow',
    });

    expect(screen.getByTestId('route-unavailable')).toBeInTheDocument();
  });

  it('allows a persisted role', () => {
    renderGuard({ surface: 'main', roleIds: ['role-1'] });

    expect(screen.getByTestId('role-page')).toBeInTheDocument();
  });

  it('contains a missing role in the side panel', () => {
    renderGuard({ surface: 'side-panel', roleIds: [] });

    expect(screen.getByTestId('route-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('role-page')).not.toBeInTheDocument();
  });

  it('contains a missing role on the main surface', () => {
    renderGuard({ surface: 'main', roleIds: [] });

    expect(screen.getByTestId('route-unavailable')).toBeInTheDocument();
    expect(screen.queryByTestId('role-page')).not.toBeInTheDocument();
  });
});
