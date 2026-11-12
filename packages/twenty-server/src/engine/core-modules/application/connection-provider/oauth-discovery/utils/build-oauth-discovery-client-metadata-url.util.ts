import { ApiPath } from 'twenty-shared/types';

export const buildOAuthDiscoveryClientMetadataUrl = (
  serverUrl: string,
): string =>
  new URL(`/${ApiPath.Auth}/apps/client-metadata.json`, serverUrl).toString();
