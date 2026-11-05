import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsAppPreferencesApp } from '~/pages/settings/accounts/SettingsAppPreferencesApp';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const INSTALLED_APPLICATION_ID =
  mockCurrentWorkspace.installedApplications[0].id;

jest.mock('@/auth/hooks/useIsLogged', () => ({
  useIsLogged: () => true,
}));

jest.mock('~/pages/settings/accounts/SettingsConnectableApp', () => ({
  SettingsConnectableApp: () => <span>Connectable app page</span>,
}));

jest.mock('~/pages/settings/accounts/SettingsBuiltInAccountApp', () => ({
  SettingsBuiltInAccountApp: () => <span>Email and calendar app page</span>,
}));

jest.mock('~/pages/settings/accounts/SettingsApplicationPreferences', () => ({
  SettingsApplicationPreferences: () => <span>Installed app page</span>,
}));

const renderAppPreferencesApp = ({
  applicationId,
  permissionFlags,
}: {
  applicationId: string;
  permissionFlags: PermissionFlagType[];
}) => {
  jotaiStore.set(currentUserWorkspaceState.atom, {
    permissionFlags,
    twoFactorAuthenticationMethodSummary: [],
    objectsPermissions: [],
    isImpersonating: false,
  });
  jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);

  render(
    <JotaiProvider store={jotaiStore}>
      <MemoryRouter
        initialEntries={[`/settings/app-preferences/${applicationId}`]}
      >
        <Routes>
          <Route
            path="/settings/app-preferences/:applicationId"
            element={<SettingsAppPreferencesApp />}
          />
          <Route path="/settings/profile" element={<span>Profile</span>} />
        </Routes>
      </MemoryRouter>
    </JotaiProvider>,
  );
};

describe('SettingsAppPreferencesApp', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('opens an app members connect, like Claude, without the connected accounts permission', () => {
    renderAppPreferencesApp({
      applicationId: '3e0bda4b-fb1d-42bd-bab3-03b66698e6ff',
      permissionFlags: [],
    });

    expect(screen.getByText('Connectable app page')).toBeInTheDocument();
  });

  it.each(['google', INSTALLED_APPLICATION_ID])(
    'keeps %s behind the connected accounts permission',
    (applicationId) => {
      renderAppPreferencesApp({ applicationId, permissionFlags: [] });

      expect(screen.getByText('Profile')).toBeInTheDocument();
    },
  );

  it('opens the other apps with the connected accounts permission', () => {
    renderAppPreferencesApp({
      applicationId: 'google',
      permissionFlags: [PermissionFlagType.CONNECTED_ACCOUNTS],
    });

    expect(screen.getByText('Email and calendar app page')).toBeInTheDocument();
  });
});
