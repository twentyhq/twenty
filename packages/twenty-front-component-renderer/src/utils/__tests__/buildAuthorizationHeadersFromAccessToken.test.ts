import { buildAuthorizationHeadersFromAccessToken } from '../buildAuthorizationHeadersFromAccessToken';

describe('buildAuthorizationHeadersFromAccessToken', () => {
  it('should build a bearer authorization header from the access token', () => {
    expect(buildAuthorizationHeadersFromAccessToken('access-token')).toEqual({
      Authorization: 'Bearer access-token',
    });
  });

  it('should return undefined when no access token is provided', () => {
    expect(buildAuthorizationHeadersFromAccessToken(undefined)).toBeUndefined();
  });

  it('should return undefined when the access token is empty', () => {
    expect(buildAuthorizationHeadersFromAccessToken('')).toBeUndefined();
  });
});
