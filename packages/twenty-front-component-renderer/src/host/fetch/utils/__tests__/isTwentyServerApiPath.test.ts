import { isTwentyServerApiPath } from '../isTwentyServerApiPath';

describe('isTwentyServerApiPath', () => {
  it.each([
    '/graphql',
    '/metadata',
    '/rest/companies',
    '/s/webhook',
    '/file/x',
  ])('should accept the server path %s', (pathname) => {
    expect(isTwentyServerApiPath(pathname)).toBe(true);
  });

  it.each([
    '/',
    '/objects/companies',
    '/cdn-cgi/access/get-identity',
    '/oauth2/userinfo',
    '/graphqlish',
  ])('should reject the non-server path %s', (pathname) => {
    expect(isTwentyServerApiPath(pathname)).toBe(false);
  });
});
