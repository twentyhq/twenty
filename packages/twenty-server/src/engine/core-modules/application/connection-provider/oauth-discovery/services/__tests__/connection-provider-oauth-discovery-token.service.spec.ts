import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { type ConnectionProviderOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-client.service';
import { ConnectionProviderOAuthDiscoveryTokenService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-discovery-token.service';
import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import { type OAuthDiscoveryConnectionProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const AUTHORIZATION_SERVER_URL = 'https://auth.example.com';

const PROVIDER = {
  id: 'provider-id',
  type: 'oauth-discovery',
  oauthDiscoveryConfig: { resourceUrl: 'https://mcp.example.com/mcp' },
} as OAuthDiscoveryConnectionProvider;

const STORED_CLIENT: OAuthDiscoveryStoredClient = {
  registrationMethod: 'DYNAMIC_CLIENT_REGISTRATION',
  redirectUri: 'https://api.twenty.test/auth/apps/callback',
  discoveryState: {
    authorizationServerUrl: AUTHORIZATION_SERVER_URL,
    authorizationServerMetadata: {
      issuer: AUTHORIZATION_SERVER_URL,
      authorization_endpoint: `${AUTHORIZATION_SERVER_URL}/authorize`,
      token_endpoint: `${AUTHORIZATION_SERVER_URL}/token`,
      response_types_supported: ['code'],
    },
  },
  clientInformation: {
    client_id: 'stored-client',
    redirect_uris: ['https://api.twenty.test/auth/apps/callback'],
  },
};

const buildService = ({
  findStoredClientOrThrow,
  tokenEndpointBody,
}: {
  findStoredClientOrThrow: jest.Mock;
  tokenEndpointBody: string;
}) => {
  const oauthClientService = {
    findStoredClientOrThrow,
    deleteClient: jest.fn(),
  } as unknown as ConnectionProviderOAuthClientService;
  const secureHttpClientService = {
    createFetchLike: () => async () =>
      new Response(tokenEndpointBody, {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  } as unknown as SecureHttpClientService;
  const twentyConfigService = {
    get: () => 'https://api.twenty.test',
  } as unknown as TwentyConfigService;

  return new ConnectionProviderOAuthDiscoveryTokenService(
    oauthClientService,
    secureHttpClientService,
    twentyConfigService,
  );
};

const refresh = (service: ConnectionProviderOAuthDiscoveryTokenService) =>
  service.refreshTokens({
    provider: PROVIDER,
    workspaceId: 'workspace-id',
    refreshToken: 'refresh-token' as PlaintextString,
  });

describe('ConnectionProviderOAuthDiscoveryTokenService.refreshTokens', () => {
  it('reports a malformed token response as a permanent refresh failure', async () => {
    const service = buildService({
      findStoredClientOrThrow: jest.fn().mockResolvedValue(STORED_CLIENT),
      tokenEndpointBody: 'not json',
    });

    await expect(refresh(service)).rejects.toMatchObject({
      constructor: ConnectionProviderException,
      code: ConnectionProviderExceptionCode.REFRESH_FAILED,
    });
  });

  it('lets a failure to load the stored client propagate as retryable', async () => {
    const databaseError = new Error('connection timeout');
    const service = buildService({
      findStoredClientOrThrow: jest.fn().mockRejectedValue(databaseError),
      tokenEndpointBody: '{}',
    });

    await expect(refresh(service)).rejects.toBe(databaseError);
  });
});
