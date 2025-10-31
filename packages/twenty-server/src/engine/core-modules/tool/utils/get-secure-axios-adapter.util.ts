import dns from 'dns/promises';

import axios, {
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';

import { isPrivateIp } from 'src/engine/core-modules/tool/utils/is-private-ip.util';
const httpAdapter = axios.getAdapter('http');

export const getSecureAdapter = (): AxiosAdapter => {
  return async (config: InternalAxiosRequestConfig) => {
    if (!config.url) {
      throw new Error('URL is required');
    }

    const url = new URL(config.url);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('URL should use http/https protocol');
    }

    const { hostname } = url;

    const { address: resolvedIp } = await dns.lookup(hostname);

    if (isPrivateIp(resolvedIp)) {
      throw new Error(
        `Request to internal IP address ${resolvedIp} is not allowed.`,
      );
    }

    return httpAdapter(config);
  };
};
