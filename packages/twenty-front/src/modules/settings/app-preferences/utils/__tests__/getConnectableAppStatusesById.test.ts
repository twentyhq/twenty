import { getConnectableAppStatusesById } from '@/settings/app-preferences/utils/getConnectableAppStatusesById';

const CONNECTABLE_APPS = [{ id: 'chatgpt-app-id' }, { id: 'claude-app-id' }];

describe('getConnectableAppStatusesById', () => {
  it('marks only the apps the member has not connected', () => {
    expect(
      getConnectableAppStatusesById({
        connectableApps: CONNECTABLE_APPS,
        authorizations: [{ oAuthIdentityUniversalIdentifier: 'claude-app-id' }],
      }),
    ).toEqual({
      'chatgpt-app-id': [{ type: 'notConnected' }],
    });
  });

  it('ignores authorizations of other OAuth clients', () => {
    expect(
      getConnectableAppStatusesById({
        connectableApps: CONNECTABLE_APPS,
        authorizations: [{ oAuthIdentityUniversalIdentifier: null }],
      }),
    ).toEqual({
      'chatgpt-app-id': [{ type: 'notConnected' }],
      'claude-app-id': [{ type: 'notConnected' }],
    });
  });

  it('shows no status rather than a wrong one when the authorizations could not be loaded', () => {
    expect(
      getConnectableAppStatusesById({
        connectableApps: CONNECTABLE_APPS,
        authorizations: undefined,
      }),
    ).toEqual({});
  });
});
