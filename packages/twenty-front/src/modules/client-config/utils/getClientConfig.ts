import { type ClientConfig } from '@/client-config/types/ClientConfig';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const getClientConfig = async (): Promise<ClientConfig> => {
  // Plain uncredentialed GET: the endpoint is public, and this request must
  // stay a simple CORS request so a split-origin deployment can still boot
  // and show a meaningful error when its origin is not allowlisted.
  const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/client-config`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch client config: ${response.status} ${response.statusText}`,
    );
  }

  const clientConfig: ClientConfig = await response.json();

  return clientConfig;
};
