import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { SettingsAppPreferencesApp } from '~/pages/settings/accounts/SettingsAppPreferencesApp';

jest.mock('@/auth/hooks/useIsLogged', () => ({
  useIsLogged: () => true,
}));

jest.mock('~/pages/settings/accounts/SettingsBuiltInMcpClientApp', () => ({
  SettingsBuiltInMcpClientApp: () => <span>ChatGPT or Claude page</span>,
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

  it('opens ChatGPT and Claude without the connected accounts permission', () => {
    renderAppPreferencesApp({ applicationId: 'claude', permissionFlags: [] });

    expect(screen.getByText('ChatGPT or Claude page')).toBeInTheDocument();
  });

  it.each(['google', 'linear-application-id'])(
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
