import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { SettingsTwoFactorAuthenticationMethod } from '~/pages/settings/SettingsTwoFactorAuthenticationMethod';

jest.mock('@/auth/hooks/useIsSsoEnabled', () => ({
  useIsSsoEnabled: jest.fn(),
}));

const useIsSsoEnabledMock: jest.Mock = jest.requireMock(
  '@/auth/hooks/useIsSsoEnabled',
).useIsSsoEnabled;

describe('SettingsTwoFactorAuthenticationMethod', () => {
  // Under SSO the IdP owns MFA — the outer component returns
  // <Navigate to=/settings/profile replace /> before any inner hook runs,
  // so the route is unreachable, not just visually hidden. The SSO-off
  // path defers to the inner component which depends on contexts we don't
  // own — out of scope for this test file.
  it('redirects to /settings/profile when SSO is enabled', () => {
    useIsSsoEnabledMock.mockReturnValue(true);

    const { container } = render(
      <MemoryRouter initialEntries={['/settings/profile/two-factor/TOTP']}>
        <Routes>
          <Route
            path="/settings/profile/two-factor/TOTP"
            element={<SettingsTwoFactorAuthenticationMethod />}
          />
          <Route
            path="/settings/profile"
            element={<div data-testid="profile-page">profile</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      container.querySelector('[data-testid="profile-page"]'),
    ).not.toBeNull();
    expect(useIsSsoEnabledMock).toHaveBeenCalled();
  });
});
