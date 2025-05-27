import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ClientConfig } from '~/generated/graphql';
import {
  getClientConfigCache,
  setClientConfigCache,
} from './clientConfigCache';

export const getClientConfig = async (): Promise<ClientConfig> => {
  const cached = getClientConfigCache();
  if (cached !== null) {
    return cached;
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
  setClientConfigCache(clientConfig);

  return clientConfig;
};
