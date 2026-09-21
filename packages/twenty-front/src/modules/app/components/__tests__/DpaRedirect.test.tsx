import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { DpaRedirect } from '@/app/components/DpaRedirect';
import { useIsLogged } from '@/auth/hooks/useIsLogged';

jest.mock('@/auth/hooks/useIsLogged');

const mockUseIsLogged = jest.mocked(useIsLogged);

const LocationProbe = () => {
  const { pathname, search } = useLocation();

  return <div data-testid="location">{`${pathname}${search}`}</div>;
};

const renderRedirect = () =>
  render(
    <MemoryRouter initialEntries={[AppPath.Dpa]}>
      <Routes>
        <Route path={AppPath.SignInUp} element={<LocationProbe />} />
        <Route
          path={getSettingsPath(SettingsPath.LegalDpa)}
          element={<LocationProbe />}
        />
        <Route path={AppPath.Dpa} element={<DpaRedirect />} />
      </Routes>
    </MemoryRouter>,
  );

const getLocation = () => screen.getByTestId('location').textContent;

describe('DpaRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects unauthenticated users to sign-in with returnToPath preserved', () => {
    mockUseIsLogged.mockReturnValue(false);

    renderRedirect();

    expect(getLocation()).toBe(
      `${AppPath.SignInUp}?returnToPath=${encodeURIComponent(
        getSettingsPath(SettingsPath.LegalDpa),
      )}`,
    );
  });

  it('redirects authenticated users directly to legal DPA settings page', () => {
    mockUseIsLogged.mockReturnValue(true);

    renderRedirect();

    expect(getLocation()).toBe(getSettingsPath(SettingsPath.LegalDpa));
  });
});
