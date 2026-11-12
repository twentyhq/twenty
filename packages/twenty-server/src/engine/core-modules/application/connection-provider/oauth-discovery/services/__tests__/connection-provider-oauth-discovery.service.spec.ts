import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';

import { ConnectionProviderOAuthClientService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-client.service';
import { ConnectionProviderOAuthDiscoveryService } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/services/connection-provider-oauth-discovery.service';
import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import { type OAuthDiscoveryConnectionProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const SERVER_URL = 'https://api.twenty.test';
const REDIRECT_URL = `${SERVER_URL}/auth/apps/callback`;
const CLIENT_METADATA_URL = `${SERVER_URL}/auth/apps/client-metadata.json`;
const RESOURCE_URL = 'https://mcp.example.com/mcp';
const AUTHORIZATION_SERVER_URL = 'https://auth.example.com';
const WORKSPACE_ID = 'workspace-id';

const PROVIDER = {
  id: 'provider-id',
  type: 'oauth-discovery',
  oauthDiscoveryConfig: { resourceUrl: RESOURCE_URL },
} as OAuthDiscoveryConnectionProvider;

const buildAuthorizationServerFetch = ({
  isClientIdMetadataDocumentSupported,
}: {
  isClientIdMetadataDocumentSupported: boolean;
}) => {
  const requestedPaths: string[] = [];

  const fetchFn: FetchLike = async (url, init) => {
    const { pathname } = new URL(url);

    requestedPaths.push(`${init?.method ?? 'GET'} ${pathname}`);

    if (pathname === '/mcp') {
      return new Response(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': `Bearer resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource/mcp", scope="read write"`,
        },
      });
    }

    if (pathname.startsWith('/.well-known/oauth-protected-resource')) {
      return Response.json({
        resource: RESOURCE_URL,
        authorization_servers: [AUTHORIZATION_SERVER_URL],
      });
    }

    if (pathname === '/.well-known/oauth-authorization-server') {
      return Response.json({
        issuer: AUTHORIZATION_SERVER_URL,
        authorization_endpoint: `${AUTHORIZATION_SERVER_URL}/authorize`,
        token_endpoint: `${AUTHORIZATION_SERVER_URL}/token`,
        registration_endpoint: `${AUTHORIZATION_SERVER_URL}/register`,
        response_types_supported: ['code'],
        code_challenge_methods_supported: ['S256'],
        client_id_metadata_document_supported:
          isClientIdMetadataDocumentSupported,
      });
    }

    if (pathname === '/register') {
      return Response.json(
        { client_id: 'registered-client', redirect_uris: [REDIRECT_URL] },
        { status: 201 },
      );
    }

    return new Response(null, { status: 404 });
  };

  return { fetchFn, requestedPaths };
};

const buildService = ({
  fetchFn,
  storedClient = null,
}: {
  fetchFn: FetchLike;
  storedClient?: OAuthDiscoveryStoredClient | null;
}) => {
  const oauthClientService = {
    findStoredClient: jest.fn().mockResolvedValue(storedClient),
    insertClientIfAbsent: jest.fn().mockResolvedValue(true),
    replaceClientIfUnchanged: jest.fn().mockResolvedValue(true),
    deleteClient: jest.fn().mockResolvedValue(undefined),
  };
  const service = new ConnectionProviderOAuthDiscoveryService(
    oauthClientService as unknown as ConnectionProviderOAuthClientService,
    {
      createFetchLike: () => fetchFn,
    } as unknown as SecureHttpClientService,
    { get: () => SERVER_URL } as unknown as TwentyConfigService,
  );

  return { service, oauthClientService };
};

describe('ConnectionProviderOAuthDiscoveryService', () => {
  it('identifies Twenty by its metadata document when the authorization server reads them', async () => {
    const { fetchFn, requestedPaths } = buildAuthorizationServerFetch({
      isClientIdMetadataDocumentSupported: true,
    });
    const { service, oauthClientService } = buildService({ fetchFn });

    const client = await service.resolveClientForAuthorization({
      provider: PROVIDER,
      workspaceId: WORKSPACE_ID,
    });

    expect(client).toMatchObject({
      authorizationEndpoint: `${AUTHORIZATION_SERVER_URL}/authorize`,
      tokenEndpoint: `${AUTHORIZATION_SERVER_URL}/token`,
      clientId: CLIENT_METADATA_URL,
      clientSecret: null,
      scopes: ['read', 'write'],
      resource: RESOURCE_URL,
      usePkce: true,
    });
    expect(requestedPaths).not.toContain('POST /register');
    expect(oauthClientService.insertClientIfAbsent).toHaveBeenCalledWith(
      expect.objectContaining({
        registrationMethod: 'CLIENT_ID_METADATA_DOCUMENT',
        redirectUri: REDIRECT_URL,
      }),
    );
  });

  it('registers a client dynamically otherwise', async () => {
    const { fetchFn } = buildAuthorizationServerFetch({
      isClientIdMetadataDocumentSupported: false,
    });
    const { service, oauthClientService } = buildService({ fetchFn });

    const client = await service.resolveClientForAuthorization({
      provider: PROVIDER,
      workspaceId: WORKSPACE_ID,
    });

    expect(client.clientId).toBe('registered-client');
    expect(oauthClientService.insertClientIfAbsent).toHaveBeenCalledWith(
      expect.objectContaining({
        registrationMethod: 'DYNAMIC_CLIENT_REGISTRATION',
      }),
    );
  });

  it('reuses a stored client and only probes the resource for its scope', async () => {
    const { fetchFn, requestedPaths } = buildAuthorizationServerFetch({
      isClientIdMetadataDocumentSupported: false,
    });
    const { service, oauthClientService } = buildService({
      fetchFn,
      storedClient: {
        registrationMethod: 'DYNAMIC_CLIENT_REGISTRATION',
        redirectUri: REDIRECT_URL,
        clientInformation: {
          client_id: 'stored-client',
          redirect_uris: [REDIRECT_URL],
        },
        discoveryState: {
          authorizationServerUrl: AUTHORIZATION_SERVER_URL,
          resourceMetadata: {
            resource: RESOURCE_URL,
            authorization_servers: [AUTHORIZATION_SERVER_URL],
          },
        },
      },
    });

    const client = await service.resolveClientForAuthorization({
      provider: PROVIDER,
      workspaceId: WORKSPACE_ID,
    });

    expect(client).toMatchObject({
      clientId: 'stored-client',
      authorizationEndpoint: `${AUTHORIZATION_SERVER_URL}/authorize`,
      tokenEndpoint: `${AUTHORIZATION_SERVER_URL}/token`,
      scopes: ['read', 'write'],
    });
    expect(requestedPaths).toEqual(['POST /mcp']);
    expect(oauthClientService.insertClientIfAbsent).not.toHaveBeenCalled();
  });

  it('refuses a token request before any sign-in stored a client', async () => {
    const { fetchFn } = buildAuthorizationServerFetch({
      isClientIdMetadataDocumentSupported: false,
    });
    const { service } = buildService({ fetchFn });

    await expect(
      service.resolveClientForTokenRequest({
        provider: PROVIDER,
        workspaceId: WORKSPACE_ID,
      }),
    ).rejects.toMatchObject({ code: 'TOKEN_EXCHANGE_FAILED' });
  });
});
