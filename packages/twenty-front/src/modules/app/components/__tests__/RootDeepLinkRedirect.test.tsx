import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

import { RootDeepLinkRedirect } from '@/app/components/RootDeepLinkRedirect';

const LocationProbe = () => {
  const { pathname, search } = useLocation();

  return <div data-testid="location">{`${pathname}${search}`}</div>;
};

const renderRedirect = (initialUrl: string) =>
  render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <Routes>
        <Route path={AppPath.SignInUp} element={<LocationProbe />} />
        <Route
          path={AppPath.NotFoundWildcard}
          element={<RootDeepLinkRedirect />}
        />
      </Routes>
    </MemoryRouter>,
  );

const getLocation = () => screen.getByTestId('location').textContent;

describe('RootDeepLinkRedirect', () => {
  it('keeps a deep link as returnToPath', () => {
    renderRedirect('/settings/applications/available/app-id');

    expect(getLocation()).toBe(
      '/welcome?returnToPath=%2Fsettings%2Fapplications%2Favailable%2Fapp-id',
    );
  });

  it('keeps the deep link search params and hash inside returnToPath', () => {
    renderRedirect('/settings/applications/available/app-id?tab=about#top');

    expect(getLocation()).toBe(
      '/welcome?tab=about&returnToPath=%2Fsettings%2Fapplications%2Favailable%2Fapp-id%3Ftab%3Dabout%23top',
    );
  });

  it('does not nest an existing returnToPath', () => {
    renderRedirect(
      '/?returnToPath=%2Fsettings%2Fapplications%2Favailable%2Fapp-id',
    );

    expect(getLocation()).toBe(
      '/welcome?returnToPath=%2Fsettings%2Fapplications%2Favailable%2Fapp-id',
    );
  });

  it('keeps the authorize deep link as returnToPath', () => {
    renderRedirect('/authorize?clientId=client-id');

    expect(getLocation()).toBe(
      '/welcome?clientId=client-id&returnToPath=%2Fauthorize%3FclientId%3Dclient-id',
    );
  });

  it('adds no returnToPath for the index path', () => {
    renderRedirect('/');

    expect(getLocation()).toBe('/welcome');
  });

  it('adds no returnToPath for an authentication path', () => {
    renderRedirect('/welcome/unknown');

    expect(getLocation()).toBe('/welcome');
  });

  it('drops an unsafe returnToPath', () => {
    renderRedirect('/?returnToPath=%2F%2Fevil.example.com');

    expect(getLocation()).toBe('/welcome');
  });
});
