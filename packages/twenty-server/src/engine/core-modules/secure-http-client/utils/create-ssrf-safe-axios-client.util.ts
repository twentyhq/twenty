import axios, {
  type AxiosInstance,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from 'axios';
import axiosRetry from 'axios-retry';
import { isNumber } from '@sniptt/guards';

import { ALLOW_ALL_INTERNAL_HOSTS } from 'src/engine/core-modules/secure-http-client/constants/allow-all-internal-hosts.constant';
import { OUTBOUND_HTTP_DEFAULT_MAX_PAYLOAD_SIZE_BYTES } from 'src/engine/core-modules/secure-http-client/constants/outbound-http-default-max-payload-size-bytes.constant';
import { OUTBOUND_HTTP_DEFAULT_TIMEOUT_MS } from 'src/engine/core-modules/secure-http-client/constants/outbound-http-default-timeout-ms.constant';
import { OutboundRequestBlockedError } from 'src/engine/core-modules/secure-http-client/errors/outbound-request-blocked.error';
import { type SecureHttpClientConfig } from 'src/engine/core-modules/secure-http-client/secure-http-client-config.type';
import { createSsrfSafeAgent } from 'src/engine/core-modules/secure-http-client/utils/create-ssrf-safe-agent.util';

const MAX_REDIRECTS = 5;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

const assertAllowedProtocol = (
  requestConfig: InternalAxiosRequestConfig,
): void => {
  const url = requestConfig.url || requestConfig.baseURL;

  if (!url) {
    return;
  }

  const parsed = new URL(url, requestConfig.baseURL);

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new OutboundRequestBlockedError(
      `Protocol ${parsed.protocol} is not allowed. Only HTTP and HTTPS are permitted.`,
    );
  }
};

export const createSsrfSafeAxiosClient = ({
  config,
  allowedInternalHosts,
}: {
  config?: SecureHttpClientConfig;
  allowedInternalHosts: string[];
}): AxiosInstance => {
  const { retries, shouldResetTimeout, ...axiosConfig } = config ?? {};
  const isSafeModeEnabled = !allowedInternalHosts.includes(
    ALLOW_ALL_INTERNAL_HOSTS,
  );

  const boundedAxiosConfig: CreateAxiosDefaults = {
    ...axiosConfig,
    maxContentLength:
      axiosConfig.maxContentLength ??
      OUTBOUND_HTTP_DEFAULT_MAX_PAYLOAD_SIZE_BYTES,
    maxBodyLength:
      axiosConfig.maxBodyLength ?? OUTBOUND_HTTP_DEFAULT_MAX_PAYLOAD_SIZE_BYTES,
  };

  const client = isSafeModeEnabled
    ? axios.create({
        ...boundedAxiosConfig,
        httpAgent: createSsrfSafeAgent('http', allowedInternalHosts),
        httpsAgent: createSsrfSafeAgent('https', allowedInternalHosts),
        maxRedirects: Math.min(
          axiosConfig.maxRedirects ?? MAX_REDIRECTS,
          MAX_REDIRECTS,
        ),
      })
    : axios.create(boundedAxiosConfig);

  if (isSafeModeEnabled) {
    const adapter = axios.getAdapter(client.defaults.adapter);

    client.defaults.adapter = async (requestConfig) => {
      assertAllowedProtocol(requestConfig);

      return adapter(requestConfig);
    };
  }

  client.interceptors.request.use((requestConfig) => {
    requestConfig.signal = AbortSignal.timeout(
      requestConfig.timeout || OUTBOUND_HTTP_DEFAULT_TIMEOUT_MS,
    );

    return requestConfig;
  });

  if (isNumber(retries) && retries > 0) {
    axiosRetry(client, {
      retries,
      shouldResetTimeout,
      retryCondition: (error) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) &&
        error.code !== 'ECONNABORTED' &&
        error.code !== 'ETIMEDOUT' &&
        error.code !== 'ERR_CANCELED',
    });
  }

  return client;
};
