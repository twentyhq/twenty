import { isDefined } from 'twenty-shared/utils';

import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';

export const isStoredOAuthClientUsable = ({
  storedClient,
  redirectUrl,
  clientMetadataUrl,
  now,
}: {
  storedClient: OAuthDiscoveryStoredClient;
  redirectUrl: string;
  clientMetadataUrl: string | null;
  now: Date;
}): boolean => {
  if (storedClient.redirectUri !== redirectUrl) {
    return false;
  }

  if (storedClient.registrationMethod === 'CLIENT_ID_METADATA_DOCUMENT') {
    return storedClient.clientInformation.client_id === clientMetadataUrl;
  }

  const secretExpiresAt =
    storedClient.clientInformation.client_secret_expires_at;

  // 0 means the secret never expires (RFC 7591)
  return (
    !isDefined(secretExpiresAt) ||
    secretExpiresAt === 0 ||
    secretExpiresAt * 1000 > now.getTime()
  );
};
