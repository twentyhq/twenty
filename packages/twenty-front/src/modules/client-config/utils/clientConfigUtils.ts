import { ClientConfig } from '~/generated/graphql';

import { REACT_APP_SERVER_BASE_URL } from '~/config';

let cachedClientConfig: ClientConfig | null = null;

export const getClientConfig = async (): Promise<ClientConfig> => {
  if (cachedClientConfig !== null) {
    return cachedClientConfig;
  }

  const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/client-config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch client config: ${response.status} ${response.statusText}`,
    );
  }

  const clientConfig: ClientConfig = await response.json();
  cachedClientConfig = clientConfig;

  return clientConfig;
};

export const refreshClientConfig = async (): Promise<ClientConfig> => {
  cachedClientConfig = null;
  return getClientConfig();
};

export const clearClientConfigCache = (): void => {
  cachedClientConfig = null;
};
