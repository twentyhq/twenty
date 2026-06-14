import { type ConnectionProviderManifest } from 'twenty-shared/application';

import { fromConnectionProviderManifestToUniversalFlatConnectionProvider } from 'src/engine/core-modules/application/application-manifest/converters/from-connection-provider-manifest-to-universal-flat-connection-provider.util';

const APP_UID = 'a8a8a8a8-a8a8-4a8a-a8a8-a8a8a8a8a8a8';
const PROVIDER_UID = '99fcd8e8-fbb1-4d2c-bc16-7c61ef3eaaaa';
const NOW = '2026-05-04T00:00:00.000Z';

const buildManifest = (
  overrides: Partial<ConnectionProviderManifest> = {},
): ConnectionProviderManifest =>
  ({
    universalIdentifier: PROVIDER_UID,
    name: 'linear',
    displayName: 'Linear',
    type: 'oauth',
    oauth: {
      authorizationEndpoint: 'https://linear.app/oauth/authorize',
      tokenEndpoint: 'https://api.linear.app/oauth/token',
      scopes: ['read', 'write'],
      clientIdVariable: 'LINEAR_CLIENT_ID',
      clientSecretVariable: 'LINEAR_CLIENT_SECRET',
    },
    ...overrides,
  }) as ConnectionProviderManifest;

describe('fromConnectionProviderManifestToUniversalFlatConnectionProvider', () => {
  it('moves OAuth manifest fields into the resolved oauthConfig blob with defaults filled', () => {
    const result =
      fromConnectionProviderManifestToUniversalFlatConnectionProvider({
        connectionProviderManifest: buildManifest(),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

    expect(result).toEqual({
      universalIdentifier: PROVIDER_UID,
      applicationUniversalIdentifier: APP_UID,
      name: 'linear',
      displayName: 'Linear',
      type: 'oauth',
      oauthConfig: {
        authorizationEndpoint: 'https://linear.app/oauth/authorize',
        tokenEndpoint: 'https://api.linear.app/oauth/token',
        revokeEndpoint: null,
        scopes: ['read', 'write'],
        clientIdVariable: 'LINEAR_CLIENT_ID',
        clientSecretVariable: 'LINEAR_CLIENT_SECRET',
        authorizationParams: null,
        tokenRequestContentType: 'json',
        usePkce: true,
      },
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it('passes through optional oauth config when provided', () => {
    const result =
      fromConnectionProviderManifestToUniversalFlatConnectionProvider({
        connectionProviderManifest: buildManifest({
          oauth: {
            authorizationEndpoint: 'https://linear.app/oauth/authorize',
            tokenEndpoint: 'https://api.linear.app/oauth/token',
            revokeEndpoint: 'https://api.linear.app/oauth/revoke',
            scopes: ['read', 'write'],
            clientIdVariable: 'LINEAR_CLIENT_ID',
            clientSecretVariable: 'LINEAR_CLIENT_SECRET',
            authorizationParams: { prompt: 'consent' },
            tokenRequestContentType: 'form-urlencoded',
            usePkce: false,
          },
        }),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

    expect(result.oauthConfig).toMatchObject({
      revokeEndpoint: 'https://api.linear.app/oauth/revoke',
      authorizationParams: { prompt: 'consent' },
      tokenRequestContentType: 'form-urlencoded',
      usePkce: false,
    });
  });

  it('defaults to json content-type and PKCE-on when oauth config omits them', () => {
    const result =
      fromConnectionProviderManifestToUniversalFlatConnectionProvider({
        connectionProviderManifest: buildManifest(),
        applicationUniversalIdentifier: APP_UID,
        now: NOW,
      });

    expect(result.oauthConfig?.tokenRequestContentType).toBe('json');
    expect(result.oauthConfig?.usePkce).toBe(true);
  });
});
