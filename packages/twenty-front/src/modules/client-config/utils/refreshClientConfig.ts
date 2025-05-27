import { ClientConfig } from '~/generated/graphql';
import { clearClientConfigCache } from './clientConfigCache';
import { getClientConfig } from './getClientConfig';

export const refreshClientConfig = async (): Promise<ClientConfig> => {
  clearClientConfigCache();
  return getClientConfig();
};
