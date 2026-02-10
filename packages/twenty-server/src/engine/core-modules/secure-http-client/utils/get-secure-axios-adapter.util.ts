import * as dns from 'dns/promises';
import * as http from 'http';
import * as https from 'https';
import { type LookupFunction } from 'net';

import axios, {
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from 'axios';

import { isPrivateIp } from 'src/engine/core-modules/secure-http-client/utils/is-private-ip.util';

import { type SecureAdapterDependencies } from './secure-adapter-dependencies.type';

const defaultDependencies: SecureAdapterDependencies = {
  dnsLookup: dns.lookup,
  httpAdapter: axios.getAdapter('http'),
};

export const getSecureAxiosAdapter = (
  dependencies: SecureAdapterDependencies = defaultDependencies,
): AxiosAdapter => {
  const { dnsLookup, httpAdapter } = dependencies;

  return async (config: InternalAxiosRequestConfig) => {
    // Resolve full URL by combining baseURL and url, matching what the
    // default axios HTTP adapter does internally. Without this, requests
    // that rely on baseURL (e.g. captcha drivers) would fail the check
    // below because config.url can be an empty string.
    const resolvedUrl = config.url
      ? config.baseURL
        ? new URL(config.url, config.baseURL).toString()
        : config.url
      : config.baseURL;

    if (!resolvedUrl) {
      throw new Error('URL is required');
    }

    const url = new URL(resolvedUrl);

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
      const lookupOptions =
        typeof optionsOrCallback === 'object' ? optionsOrCallback : {};
      const callback =
        typeof optionsOrCallback === 'function'
          ? optionsOrCallback
          : maybeCallback;

      if (lookupOptions.all) {
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
