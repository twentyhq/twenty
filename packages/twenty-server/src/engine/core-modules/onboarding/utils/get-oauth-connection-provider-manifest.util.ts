import {
  type ConnectionProviderManifest,
  type Manifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

export const getOAuthConnectionProviderManifest = ({
  manifest,
  providerName,
}: {
  manifest: Manifest | null;
  providerName: string;
}): ConnectionProviderManifest | undefined => {
  if (!isDefined(manifest)) {
    return undefined;
  }

  return manifest.connectionProviders?.find(
    (connectionProvider) =>
      connectionProvider.name === providerName &&
      connectionProvider.type === 'oauth',
  );
};
