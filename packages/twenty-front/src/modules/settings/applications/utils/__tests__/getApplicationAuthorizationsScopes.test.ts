import { getApplicationAuthorizationsScopes } from '@/settings/applications/utils/getApplicationAuthorizationsScopes';

describe('getApplicationAuthorizationsScopes', () => {
  it('merges the scopes of every grant once', () => {
    expect(
      getApplicationAuthorizationsScopes([
        { scopes: ['profile'] },
        { scopes: ['api', 'profile'] },
      ]),
    ).toEqual({ scopes: ['profile', 'api'], hasUnrecordedScopes: false });
  });

  it('flags a grant whose scopes were never recorded', () => {
    expect(
      getApplicationAuthorizationsScopes([
        { scopes: ['profile'] },
        { scopes: null },
      ]),
    ).toEqual({ scopes: ['profile'], hasUnrecordedScopes: true });
  });
});
