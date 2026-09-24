import { isNonEmptyString } from '@sniptt/guards';

import { type ClientConfig } from '@/client-config/types/ClientConfig';
import {
  REACT_APP_CLIENT_CONFIG_CACHE_KEY,
  REACT_APP_SERVER_BASE_URL,
} from '~/config';

const getClientConfigUrl = (): string => {
  const clientConfigUrl = `${REACT_APP_SERVER_BASE_URL}/client-config`;

  if (!isNonEmptyString(REACT_APP_CLIENT_CONFIG_CACHE_KEY)) {
    return clientConfigUrl;
  }

  return `${clientConfigUrl}?cacheKey=${encodeURIComponent(REACT_APP_CLIENT_CONFIG_CACHE_KEY)}`;
};

export const getClientConfig = async (): Promise<ClientConfig> => {
  const response = await fetch(getClientConfigUrl());

  if (!response.ok) {
    throw new Error(
      `Failed to fetch client config: ${response.status} ${response.statusText}`,
    );
  }

  const clientConfig: ClientConfig = await response.json();

  return clientConfig;
};
