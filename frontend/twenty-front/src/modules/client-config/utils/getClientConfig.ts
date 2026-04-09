import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const getClientConfig = async (): Promise<ClientConfig> => {
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

  return clientConfig;
};
