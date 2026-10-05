import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { SettingsRoleRouteGuard } from '@/settings/roles/components/SettingsRoleRouteGuard';
import { settingsRoleIdsState } from '@/settings/roles/states/settingsRoleIdsState';
import { settingsRolesIsLoadingState } from '@/settings/roles/states/settingsRolesIsLoadingState';
import {
  WorkspaceSurfaceContext,
  type WorkspaceSurfaceContextValue,
} from '@/ui/layout/contexts/WorkspaceSurfaceContext';

jest.mock('@/settings/roles/components/SettingsRolesQueryEffect', () => ({
  SettingsRolesQueryEffect: () => null,
}));

jest.mock('@/app/routing/components/WorkspaceRouteUnavailable', () => ({
  WorkspaceRouteUnavailable: () => <div data-testid="route-unavailable" />,
}));

const renderGuard = ({
  surface,
  roleIds,
}: {
  surface: WorkspaceSurfaceContextValue['type'];
  roleIds: string[];
}) => {
  const store = createStore();

  store.set(settingsRoleIdsState.atom, roleIds);
  store.set(settingsRolesIsLoadingState.atom, false);

  render(
    <JotaiProvider store={store}>
      <WorkspaceSurfaceContext.Provider
        value={{
          type: surface,
          instanceId: `${surface}-surface`,
          ownsRouteLocation: true,
        }}
      >
        <SettingsRoleRouteGuard roleId="role-1">
          <div data-testid="role-page" />
        </SettingsRoleRouteGuard>
      </WorkspaceSurfaceContext.Provider>
    </JotaiProvider>,
  );
};

describe('SettingsRoleRouteGuard', () => {
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
