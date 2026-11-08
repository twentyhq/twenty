import { auth } from '@modelcontextprotocol/sdk/client/auth.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';

import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import { buildOAuthDiscoveryClientMetadata } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-metadata.util';
import { OAuthDiscoveryClientProvider } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/oauth-discovery-client-provider';

const SERVER_URL = 'https://api.twenty.test';
const REDIRECT_URL = `${SERVER_URL}/auth/apps/callback`;
const CLIENT_METADATA_URL = `${SERVER_URL}/auth/apps/client-metadata.json`;
const MCP_SERVER_URL = 'https://mcp.example.com/mcp';
const AUTHORIZATION_SERVER_URL = 'https://auth.example.com';
const NOW = new Date('2026-11-07T12:00:00Z');

const buildStoredClient = (
  overrides: Partial<OAuthDiscoveryStoredClient> = {},
): OAuthDiscoveryStoredClient => ({
  registrationMethod: 'DYNAMIC_CLIENT_REGISTRATION',
  redirectUri: REDIRECT_URL,
  discoveryState: { authorizationServerUrl: AUTHORIZATION_SERVER_URL },
  clientInformation: {
    client_id: 'stored-client',
    redirect_uris: [REDIRECT_URL],
  },
  ...overrides,
});

const buildProvider = ({
  storedClient = null,
  clientMetadataUrl = CLIENT_METADATA_URL,
}: {
  storedClient?: OAuthDiscoveryStoredClient | null;
  clientMetadataUrl?: string;
} = {}) =>
  new OAuthDiscoveryClientProvider({
    redirectUrl: REDIRECT_URL,
    clientMetadataUrl,
    clientMetadata: buildOAuthDiscoveryClientMetadata(SERVER_URL),
    storedClient,
    shouldReuseStoredDiscoveryState: false,
    now: NOW,
  });

const buildAuthorizationServerFetch = ({
  isClientIdMetadataDocumentSupported,
  registeredClientId = 'registered-client',
}: {
  isClientIdMetadataDocumentSupported: boolean;
  registeredClientId?: string;
}) => {
  const requestedUrls: string[] = [];

  const fetchFn: FetchLike = async (url) => {
    const { href, pathname } = new URL(url);

    requestedUrls.push(href);

    if (pathname.startsWith('/.well-known/oauth-protected-resource')) {
      return Response.json({
        resource: MCP_SERVER_URL,
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
      return Response.json({
        client_id: registeredClientId,
        redirect_uris: [REDIRECT_URL],
      });
    }

    return new Response(null, { status: 404 });
  };

  return { fetchFn, requestedUrls };
};

describe('OAuthDiscoveryClientProvider', () => {
  it('identifies Twenty by its metadata document when the authorization server supports it', async () => {
    const provider = buildProvider();
    const { fetchFn, requestedUrls } = buildAuthorizationServerFetch({
      isClientIdMetadataDocumentSupported: true,
    });

    await expect(
      auth(provider, { serverUrl: MCP_SERVER_URL, fetchFn }),
    ).resolves.toBe('REDIRECT');

    expect(provider.authorizationUrl?.searchParams.get('client_id')).toBe(
      CLIENT_METADATA_URL,
    );
    expect(provider.authorizationUrl?.searchParams.get('resource')).toBe(
      MCP_SERVER_URL,
    );
    expect(requestedUrls).not.toContain(`${AUTHORIZATION_SERVER_URL}/register`);
    expect(provider.getClientToPersist()?.registrationMethod).toBe(
      'CLIENT_ID_METADATA_DOCUMENT',
    );
  });

  it('registers dynamically when the authorization server does not read metadata documents', async () => {
    const provider = buildProvider();
    const { fetchFn } = buildAuthorizationServerFetch({
      isClientIdMetadataDocumentSupported: false,
    });

    await auth(provider, { serverUrl: MCP_SERVER_URL, fetchFn });

    expect(provider.authorizationUrl?.searchParams.get('client_id')).toBe(
      'registered-client',
    );
    expect(provider.getClientToPersist()?.registrationMethod).toBe(
      'DYNAMIC_CLIENT_REGISTRATION',
    );
  });

  it('reuses the stored client registered with the same authorization server', async () => {
    const provider = buildProvider({ storedClient: buildStoredClient() });
    const { fetchFn, requestedUrls } = buildAuthorizationServerFetch({
      isClientIdMetadataDocumentSupported: false,
    });

    await auth(provider, { serverUrl: MCP_SERVER_URL, fetchFn });

    expect(provider.authorizationUrl?.searchParams.get('client_id')).toBe(
      'stored-client',
    );
    expect(requestedUrls).not.toContain(`${AUTHORIZATION_SERVER_URL}/register`);
  });

  it.each([
    [
      'another authorization server',
      buildStoredClient({
        discoveryState: {
          authorizationServerUrl: 'https://old-auth.example.com',
        },
      }),
    ],
    [
      'another callback URL',
      buildStoredClient({ redirectUri: 'https://old.twenty.test/callback' }),
    ],
    [
      'an expired client secret',
      buildStoredClient({
        clientInformation: {
          client_id: 'stored-client',
          client_secret: 'secret',
          client_secret_expires_at: NOW.getTime() / 1000 - 60,
          redirect_uris: [REDIRECT_URL],
        },
      }),
    ],
    [
      'another metadata document URL',
      buildStoredClient({
        registrationMethod: 'CLIENT_ID_METADATA_DOCUMENT',
        clientInformation: {
          client_id: 'https://old.twenty.test/client-metadata.json',
          redirect_uris: [REDIRECT_URL],
        },
      }),
    ],
  ])('registers again over a stored client for %s', async (_, storedClient) => {
    const provider = buildProvider({ storedClient });
    const { fetchFn } = buildAuthorizationServerFetch({
      isClientIdMetadataDocumentSupported: false,
    });

    await auth(provider, { serverUrl: MCP_SERVER_URL, fetchFn });

    expect(provider.authorizationUrl?.searchParams.get('client_id')).toBe(
      'registered-client',
    );
  });

  it('drops the stored client once the authorization server rejects it', () => {
    const provider = buildProvider({ storedClient: buildStoredClient() });

    provider.saveDiscoveryState({
      authorizationServerUrl: AUTHORIZATION_SERVER_URL,
    });
    expect(provider.clientInformation()?.client_id).toBe('stored-client');

    provider.invalidateCredentials('client');

    expect(provider.clientInformation()).toBeUndefined();
    expect(provider.isStoredClientInvalidated).toBe(true);
  });
});
