import { ClientConfig } from '~/generated/graphql';

export const getClientConfigFromWindow = (): ClientConfig | null => {
  try {
    const clientConfigString = window._env_?.TWENTY_CLIENT_CONFIG;
    if (clientConfigString != null && clientConfigString !== '') {
      return JSON.parse(clientConfigString) as ClientConfig;
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to read client config from window object:', error);
    return null;
  }
};
