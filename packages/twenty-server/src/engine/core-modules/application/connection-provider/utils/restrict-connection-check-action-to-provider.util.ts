import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isSafeInternalPath } from 'twenty-shared/utils';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';

type ConnectionCheckProvider = Pick<
  ConnectionProviderEntity,
  'oauthConfig' | 'oauthDiscoveryConfig'
>;

const getHostname = (url: string | null | undefined): string | undefined => {
  if (!isNonEmptyString(url)) {
    return undefined;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
};

const getProviderHostnames = ({
  oauthConfig,
  oauthDiscoveryConfig,
}: ConnectionCheckProvider): string[] =>
  [
    oauthConfig?.authorizationEndpoint,
    oauthConfig?.tokenEndpoint,
    oauthConfig?.revokeEndpoint,
    oauthDiscoveryConfig?.resourceUrl,
  ]
    .map(getHostname)
    .filter(isDefined);

const isAllowedActionLocation = ({
  location,
  provider,
}: {
  location: string;
  provider: ConnectionCheckProvider;
}): boolean => {
  if (isSafeInternalPath(location)) {
    return true;
  }

  try {
    const url = new URL(location);

    return (
      url.protocol === 'https:' &&
      getProviderHostnames(provider).includes(url.hostname)
    );
  } catch {
    return false;
  }
};

// The action fixes what happens at the provider (install the app, grant
// consent), so it may leave Twenty, but only for the provider's own hosts.
export const restrictConnectionCheckActionToProvider = ({
  result,
  provider,
}: {
  result: ApplicationHealthCheckResultDTO;
  provider: ConnectionCheckProvider;
}): ApplicationHealthCheckResultDTO => {
  const location = result.action?.location;

  if (
    !isNonEmptyString(location) ||
    isAllowedActionLocation({ location, provider })
  ) {
    return result;
  }

  return { ...result, action: null };
};
