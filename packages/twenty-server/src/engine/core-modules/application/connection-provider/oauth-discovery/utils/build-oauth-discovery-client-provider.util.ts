import { isHttpsUrl } from '@modelcontextprotocol/sdk/client/auth.js';

import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';
import { buildOAuthDiscoveryClientMetadataUrl } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-metadata-url.util';
import { buildOAuthDiscoveryClientMetadata } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/build-oauth-discovery-client-metadata.util';
import { OAuthDiscoveryClientProvider } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/utils/oauth-discovery-client-provider';
import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';

export const buildOAuthDiscoveryClientProvider = ({
  serverUrl,
  storedClient,
  codeVerifier,
  shouldReuseStoredDiscoveryState,
  isClientIdMetadataDocumentAllowed = true,
}: {
  serverUrl: string;
  storedClient: OAuthDiscoveryStoredClient | null;
  codeVerifier?: string;
  shouldReuseStoredDiscoveryState: boolean;
  isClientIdMetadataDocumentAllowed?: boolean;
}): OAuthDiscoveryClientProvider => {
  const clientMetadataUrl = buildOAuthDiscoveryClientMetadataUrl(serverUrl);

  return new OAuthDiscoveryClientProvider({
    redirectUrl: buildAppOAuthCallbackUrl(serverUrl),
    // An authorization server only fetches a metadata document over HTTPS.
    clientMetadataUrl:
      isClientIdMetadataDocumentAllowed && isHttpsUrl(clientMetadataUrl)
        ? clientMetadataUrl
        : undefined,
    clientMetadata: buildOAuthDiscoveryClientMetadata(serverUrl),
    storedClient,
    codeVerifier,
    shouldReuseStoredDiscoveryState,
    now: new Date(),
  });
};
