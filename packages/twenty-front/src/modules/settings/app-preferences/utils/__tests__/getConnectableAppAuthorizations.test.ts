import { getConnectableAppAuthorizations } from '@/settings/app-preferences/utils/getConnectableAppAuthorizations';

describe('getConnectableAppAuthorizations', () => {
  it('keeps only the authorizations issued to the connectable app', () => {
    expect(
      getConnectableAppAuthorizations({
        authorizations: [
          { id: 'claude', oAuthIdentityUniversalIdentifier: 'claude-app' },
          { id: 'chatgpt', oAuthIdentityUniversalIdentifier: 'chatgpt-app' },
          { id: 'other', oAuthIdentityUniversalIdentifier: null },
        ],
        connectableAppId: 'claude-app',
      }),
    ).toEqual([
      { id: 'claude', oAuthIdentityUniversalIdentifier: 'claude-app' },
    ]);
  });
});
