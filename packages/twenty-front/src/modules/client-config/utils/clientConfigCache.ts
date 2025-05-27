import { ClientConfig } from '~/generated/graphql';

let cachedClientConfig: ClientConfig | null = null;

export const getClientConfigCache = (): ClientConfig | null => {
  return cachedClientConfig;
};

export const setClientConfigCache = (config: ClientConfig | null): void => {
  cachedClientConfig = config;
};

export const clearClientConfigCache = (): void => {
  cachedClientConfig = null;
};
