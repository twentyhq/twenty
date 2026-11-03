import { buildAdminConsoleSignInUrl } from '@/settings/admin-panel/admin-console/utils/buildAdminConsoleSignInUrl';

describe('buildAdminConsoleSignInUrl', () => {
  it('points at the console verify page with the token and the full return path', () => {
    const signInUrl = new URL(
      buildAdminConsoleSignInUrl({
        adminConsoleUrl: 'https://admin.example.com',
        loginToken: 'token',
        returnToPath: '/settings/admin-panel?tab=1#organization',
      }),
    );

    expect(signInUrl.origin).toBe('https://admin.example.com');
    expect(signInUrl.pathname).toBe('/verify');
    expect(signInUrl.searchParams.get('loginToken')).toBe('token');
    expect(signInUrl.searchParams.get('returnToPath')).toBe(
      '/settings/admin-panel?tab=1#organization',
    );
  });
});
