import { isDefined } from 'twenty-shared/utils';

import { type OAuthDiscoveryStoredClient } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/types/oauth-discovery-stored-client.type';

const NEVER_EXPIRES = 0;

export const isStoredOAuthClientUsable = ({
  storedClient,
  redirectUrl,
  clientMetadataUrl,
  now,
}: {
  storedClient: Pick<
    OAuthDiscoveryStoredClient,
    'redirectUri' | 'registrationMethod' | 'clientInformation'
  >;
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

  return (
    !isDefined(secretExpiresAt) ||
    secretExpiresAt === NEVER_EXPIRES ||
    secretExpiresAt * 1000 > now.getTime()
  );
};
