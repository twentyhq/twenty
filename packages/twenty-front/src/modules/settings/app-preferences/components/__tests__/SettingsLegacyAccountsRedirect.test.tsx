import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsLegacyAccountsRedirect } from '@/settings/app-preferences/components/SettingsLegacyAccountsRedirect';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const CurrentLocation = () => {
  const { pathname, search, hash } = useLocation();

  return <span>{`${pathname}${search}${hash}`}</span>;
};

const setAppPreferencesFlag = (value: boolean) =>
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [{ key: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED, value }],
  });

const renderLegacyAccountsRoute = (initialEntry: string) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<SettingsLegacyAccountsRedirect />}>
            <Route
              path={getSettingsPath(SettingsPath.Accounts)}
              element={<span>Legacy accounts page</span>}
            />
            <Route
              path={getSettingsPath(SettingsPath.AccountsConfiguration)}
              element={<span>Legacy configuration page</span>}
            />
          </Route>
          <Route
            path={`${getSettingsPath(SettingsPath.AppPreferences)}/*`}
            element={<CurrentLocation />}
          />
        </Routes>
      </MemoryRouter>
    </JotaiProvider>,
  );

describe('SettingsLegacyAccountsRedirect', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('keeps the legacy page when app preferences are off', () => {
    setAppPreferencesFlag(false);

    renderLegacyAccountsRoute('/settings/accounts/configuration/account-id');

    expect(screen.getByText('Legacy configuration page')).toBeInTheDocument();
  });

  it('forwards to the app preferences page with its query and hash when app preferences are on', () => {
    setAppPreferencesFlag(true);

    renderLegacyAccountsRoute(
      '/settings/accounts/configuration/account-id?errorMessage=failed#calendar',
    );

    expect(
      screen.getByText(
        '/settings/app-preferences/accounts/account-id/configuration?errorMessage=failed#calendar',
      ),
    ).toBeInTheDocument();
  });

  it('forwards the accounts root to the app preferences root', () => {
    setAppPreferencesFlag(true);

    renderLegacyAccountsRoute('/settings/accounts#accounts');

    expect(
      screen.getByText('/settings/app-preferences#accounts'),
    ).toBeInTheDocument();
  });
});
