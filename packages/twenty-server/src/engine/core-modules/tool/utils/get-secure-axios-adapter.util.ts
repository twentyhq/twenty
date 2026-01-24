import dns from 'dns/promises';

import axios, {
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';

import { isPrivateIp } from 'src/engine/core-modules/tool/utils/is-private-ip.util';

export type SecureAdapterDependencies = {
  dnsLookup: typeof dns.lookup;
  httpAdapter: AxiosAdapter;
};

const defaultDependencies: SecureAdapterDependencies = {
  dnsLookup: dns.lookup,
  httpAdapter: axios.getAdapter('http'),
};

export const getSecureAdapter = (
  dependencies: SecureAdapterDependencies = defaultDependencies,
): AxiosAdapter => {
  const { dnsLookup, httpAdapter } = dependencies;

  return async (config: InternalAxiosRequestConfig) => {
    if (!config.url) {
      throw new Error('URL is required');
    }

    const url = new URL(config.url);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('URL should use http/https protocol');
    }

    const originalHostname = url.hostname;
    const originalPort = url.port;

    const { address: resolvedIp } = await dnsLookup(originalHostname);

    if (isPrivateIp(resolvedIp)) {
      throw new Error(
        `Request to internal IP address ${resolvedIp} is not allowed.`,
      );
    }

    // Replace hostname with resolved IP to prevent DNS rebinding attacks.
    // This ensures the actual HTTP request goes to the validated IP address,
    // not a potentially different IP from a second DNS lookup.
    url.hostname = resolvedIp;
    config.url = url.toString();

    // Preserve the original Host header for virtual hosting compatibility
    const hostHeader = originalPort
      ? `${originalHostname}:${originalPort}`
      : originalHostname;

    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (config.headers instanceof AxiosHeaders) {
      config.headers.set('Host', hostHeader);
    } else {
      (config.headers as Record<string, string>)['Host'] = hostHeader;
    }

    return httpAdapter(config);
  };
};
