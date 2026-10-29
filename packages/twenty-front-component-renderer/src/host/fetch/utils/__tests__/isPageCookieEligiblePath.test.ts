import { isPageCookieEligiblePath } from '../isPageCookieEligiblePath';

describe('isPageCookieEligiblePath', () => {
  it.each(['/graphql', '/metadata', '/rest/companies', '/file/x', '/files/x'])(
    'should accept the API path %s',
    (pathname) => {
      expect(isPageCookieEligiblePath(pathname)).toBe(true);
    },
  );

  it.each([
    '/',
    '/objects/companies',
    '/cdn-cgi/access/get-identity',
    '/oauth2/userinfo',
    '/graphqlish',
    '/s/my-route',
    '/webhooks/server/my-route',
    '/auth/apps/custom/callback',
  ])('should reject the path %s', (pathname) => {
    expect(isPageCookieEligiblePath(pathname)).toBe(false);
  });
});
