import * as dns from 'dns/promises';
import * as http from 'http';
import * as https from 'https';
import { type LookupFunction } from 'net';

import axios, {
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';

import { isPrivateIp } from 'src/engine/core-modules/tool/utils/is-private-ip.util';

import { type SecureAdapterDependencies } from './get-secure-axios-adapter.types';

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

    const { address: resolvedIp, family } = await dnsLookup(url.hostname);

    if (isPrivateIp(resolvedIp)) {
      throw new Error(
        `Request to internal IP address ${resolvedIp} is not allowed.`,
      );
    }

    // Use a custom lookup function that returns our pre-validated IP.
    // This prevents DNS rebinding attacks while preserving the original
    // hostname in the URL for proper TLS certificate validation and SNI.
    // Note: LookupFunction can be called with 2 or 3 arguments, and when
    // options.all is true, it expects an array of addresses.
    const ipFamily = family === 6 ? 6 : 4;
    const secureLookup: LookupFunction = (
      _hostname,
      optionsOrCallback,
      maybeCallback,
    ) => {
      const options =
        typeof optionsOrCallback === 'object' ? optionsOrCallback : {};
      const callback =
        typeof optionsOrCallback === 'function'
          ? optionsOrCallback
          : maybeCallback;

      if (options.all) {
        (callback as Function)(null, [
          { address: resolvedIp, family: ipFamily },
        ]);
      } else {
        (callback as Function)(null, resolvedIp, ipFamily);
      }
    };

    if (url.protocol === 'https:') {
      config.httpsAgent = new https.Agent({ lookup: secureLookup });
    } else {
      config.httpAgent = new http.Agent({ lookup: secureLookup });
    }

    return httpAdapter(config);
  };
};
