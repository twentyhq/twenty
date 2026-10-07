import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsAppPreferencesRouteGuard } from '@/settings/app-preferences/components/SettingsAppPreferencesRouteGuard';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const renderRoute = ({
  enabled,
  canManageAccounts,
}: {
  enabled?: boolean;
  canManageAccounts: boolean;
}) => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: isDefined(enabled)
      ? [{ key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value: enabled }]
      : [],
  });
  jotaiStore.set(currentUserWorkspaceState.atom, {
    permissionFlags: canManageAccounts
      ? [PermissionFlagType.CONNECTED_ACCOUNTS]
      : [],
    twoFactorAuthenticationMethodSummary: [],
    objectsPermissions: [],
    isImpersonating: false,
  });

  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter
        initialEntries={[getSettingsPath(SettingsPath.AppPreferences)]}
      >
        <Routes>
          <Route element={<SettingsAppPreferencesRouteGuard />}>
            <Route
              path={getSettingsPath(SettingsPath.AppPreferences)}
              element={<div>App preferences page</div>}
            />
          </Route>
          <Route
            path={getSettingsPath(SettingsPath.Accounts)}
            element={<div>Legacy accounts page</div>}
          />
          <Route
            path={getSettingsPath(SettingsPath.ProfilePage)}
            element={<div>Profile page</div>}
          />
        </Routes>
      </MemoryRouter>
    </JotaiProvider>,
  );
};

beforeEach(resetJotaiStore);

it.each([undefined, false])(
  'falls back to Accounts with connected-account permission when flag is %s',
  (enabled) => {
    renderRoute({ enabled, canManageAccounts: true });
    expect(screen.getByText('Legacy accounts page')).toBeInTheDocument();
  },
);

it.each([undefined, false])(
  'falls back to Profile without connected-account permission when flag is %s',
  (enabled) => {
    renderRoute({ enabled, canManageAccounts: false });
    expect(screen.getByText('Profile page')).toBeInTheDocument();
  },
);

it('allows a member without connected-account permission into the enabled overview', () => {
  renderRoute({ enabled: true, canManageAccounts: false });
  expect(screen.getByText('App preferences page')).toBeInTheDocument();
});
