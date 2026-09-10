import { render, screen, waitFor } from '@testing-library/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { SettingsProtectedRouteWrapper } from '@/settings/components/SettingsProtectedRouteWrapper';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({
  [SOURCE_LOCALE]: messages,
});
i18n.activate(SOURCE_LOCALE);

const useIsLoggedMock = jest.fn(() => true);
const useHasPermissionFlagMock = jest.fn(() => false);
const useIsFeatureEnabledMock = jest.fn(() => true);

jest.mock('@/auth/hooks/useIsLogged', () => ({
  useIsLogged: () => useIsLoggedMock(),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => useHasPermissionFlagMock(),
}));

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => useIsFeatureEnabledMock(),
}));

const CurrentPathname = () => {
  const location = useLocation();

  return <span data-testid="pathname">{location.pathname}</span>;
};

const renderProtectedRoute = (surface: 'main' | 'side-panel') =>
  render(
    <WorkspaceSurfaceContext.Provider
      value={{
        type: surface,
        instanceId: surface === 'main' ? 'main' : 'panel-page-1',
        ownsRouteLocation: true,
      }}
    >
      <I18nProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/settings/roles']}>
          <CurrentPathname />
          <Routes>
            <Route
              path="/settings/roles"
              element={
                <SettingsProtectedRouteWrapper
                  settingsPermission={PermissionFlagType.ROLES}
                >
                  <span>Protected settings</span>
                </SettingsProtectedRouteWrapper>
              }
            />
            <Route path="/settings/profile" element={<span>Profile</span>} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>
    </WorkspaceSurfaceContext.Provider>,
  );

describe('SettingsProtectedRouteWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useIsLoggedMock.mockReturnValue(true);
    useHasPermissionFlagMock.mockReturnValue(false);
    useIsFeatureEnabledMock.mockReturnValue(true);
  });

  it('keeps a denied side-panel route in place', () => {
    renderProtectedRoute('side-panel');

    expect(screen.getByTestId('pathname')).toHaveTextContent('/settings/roles');
    expect(
      screen.getByText("You don't have access to this settings page."),
    ).toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('preserves the existing profile redirect on the main surface', async () => {
    renderProtectedRoute('main');

    await waitFor(() =>
      expect(screen.getByTestId('pathname')).toHaveTextContent(
        '/settings/profile',
      ),
    );
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
