import { isNonEmptyString } from '@sniptt/guards';

export const buildRegistryRequestHeaders = ({
  url,
  registryUrl,
  authToken,
}: {
  url: string;
  registryUrl: string;
  authToken?: string | null;
}): Record<string, string> => {
  if (!isNonEmptyString(authToken)) {
    return {};
  }

  const isRegistryHost = new URL(url).host === new URL(registryUrl).host;

  return isRegistryHost ? { Authorization: `Bearer ${authToken}` } : {};
};
