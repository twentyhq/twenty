import * as http from 'http';

import { Injectable, Logger } from '@nestjs/common';

import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import axiosRetry from 'axios-retry';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { buildAxiosFetch } from '@lifeomic/axios-fetch';

import { createSsrfSafeAgent } from 'src/engine/core-modules/secure-http-client/utils/create-ssrf-safe-agent.util';
import { ALLOW_ALL_INTERNAL_HOSTS } from 'src/engine/core-modules/secure-http-client/constants/allow-all-internal-hosts.constant';
import { OUTBOUND_HTTP_DEFAULT_MAX_PAYLOAD_SIZE_BYTES } from 'src/engine/core-modules/secure-http-client/constants/outbound-http-default-max-payload-size-bytes.constant';
import { OUTBOUND_HTTP_DEFAULT_TIMEOUT_MS } from 'src/engine/core-modules/secure-http-client/constants/outbound-http-default-timeout-ms.constant';
import { normalizeAllowedInternalHost } from 'src/engine/core-modules/secure-http-client/utils/normalize-allowed-internal-host.util';
import { resolveAndValidateHostname } from 'src/engine/core-modules/secure-http-client/utils/resolve-and-validate-hostname.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { type OutboundRequestContext } from './outbound-request-context.type';

const MAX_REDIRECTS = 5;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

type SecureHttpClientConfig = CreateAxiosDefaults & {
  retries?: number;
  shouldResetTimeout?: boolean;
};

@Injectable()
export class SecureHttpClientService {
  private readonly logger = new Logger(SecureHttpClientService.name);
  private hasWarnedAboutDeprecatedSafeModeFlag = false;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  // SSRF protection is enforced at connection level by validating resolved IPs, which also covers redirects.
  // With a context, outbound requests are logged with workspace/user info for GuardDuty correlation.
  getHttpClient(
    config?: SecureHttpClientConfig,
    context?: OutboundRequestContext,
  ): AxiosInstance {
    const { retries, shouldResetTimeout, ...axiosConfig } = config ?? {};

    const allowedInternalHosts = this.getAllowedInternalHosts();
    const isSafeModeEnabled = this.isSafeModeEnabled(allowedInternalHosts);

    const boundedAxiosConfig: CreateAxiosDefaults = {
      ...axiosConfig,
      maxContentLength:
        axiosConfig.maxContentLength ??
        OUTBOUND_HTTP_DEFAULT_MAX_PAYLOAD_SIZE_BYTES,
      maxBodyLength:
        axiosConfig.maxBodyLength ??
        OUTBOUND_HTTP_DEFAULT_MAX_PAYLOAD_SIZE_BYTES,
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

    client.interceptors.request.use((requestConfig) => {
      const deadlineSignal = AbortSignal.timeout(
        requestConfig.timeout || OUTBOUND_HTTP_DEFAULT_TIMEOUT_MS,
      );

      requestConfig.signal = isDefined(requestConfig.signal)
        ? AbortSignal.any([requestConfig.signal as AbortSignal, deadlineSignal])
        : deadlineSignal;

      return requestConfig;
    });

    if (isDefined(retries) && retries > 0) {
      axiosRetry(client, {
        retries,
        shouldResetTimeout,
        retryCondition: (error) =>
          axiosRetry.isNetworkOrIdempotentRequestError(error) &&
          error.code !== 'ECONNABORTED' &&
          error.code !== 'ETIMEDOUT',
      });
    }

    if (isSafeModeEnabled) {
      client.interceptors.request.use((requestConfig) => {
        const url = requestConfig.url || requestConfig.baseURL;

        if (url) {
          const parsed = new URL(url, requestConfig.baseURL);

          if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
            throw new Error(
              `Protocol ${parsed.protocol} is not allowed. Only HTTP and HTTPS are permitted.`,
            );
          }
        }

        return requestConfig;
      });
    }

    if (context) {
      client.interceptors.request.use((requestConfig) => {
        this.logger.log(
          `Outbound HTTP request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url} ` +
            `[workspace=${context.workspaceId}, source=${context.source}` +
            `${context.userId ? `, user=${context.userId}` : ''}]`,
        );

        return requestConfig;
      });
    }

    return client;
  }

  // Not SSRF-protected: trusted internal URLs only.
  getInternalHttpClient(config?: CreateAxiosDefaults): AxiosInstance {
    return axios.create(config);
  }

  createSsrfSafeFetch(): typeof globalThis.fetch {
    return buildAxiosFetch(this.getHttpClient()) as typeof globalThis.fetch;
  }

  // For libraries that only accept an agent (openid-client); undefined means no restriction.
  getSsrfSafeAgent(url: URL): http.Agent | undefined {
    const allowedInternalHosts = this.getAllowedInternalHosts();

    if (!this.isSafeModeEnabled(allowedInternalHosts)) {
      return undefined;
    }

    return createSsrfSafeAgent(
      url.protocol === 'https:' ? 'https' : 'http',
      allowedInternalHosts,
    );
  }

  async getValidatedHost(hostnameOrUrl: string): Promise<string> {
    const allowedInternalHosts = this.getAllowedInternalHosts();

    if (!this.isSafeModeEnabled(allowedInternalHosts)) {
      return hostnameOrUrl;
    }

    return resolveAndValidateHostname(hostnameOrUrl, allowedInternalHosts);
  }

  private getAllowedInternalHosts(): string[] {
    // Deprecated but still honoured so self-hosted setups that disabled it keep working.
    if (
      this.twentyConfigService.get('OUTBOUND_HTTP_SAFE_MODE_ENABLED') === false
    ) {
      if (!this.hasWarnedAboutDeprecatedSafeModeFlag) {
        this.hasWarnedAboutDeprecatedSafeModeFlag = true;
        this.logger.warn(
          'OUTBOUND_HTTP_SAFE_MODE_ENABLED=false is deprecated and overrides OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: every private address is reachable. Remove it and list the internal hosts you need instead.',
        );
      }

      return [ALLOW_ALL_INTERNAL_HOSTS];
    }

    return this.twentyConfigService
      .get('OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS')
      .map(normalizeAllowedInternalHost)
      .filter(isNonEmptyString);
  }

  private isSafeModeEnabled(allowedInternalHosts: string[]): boolean {
    return !allowedInternalHosts.includes(ALLOW_ALL_INTERNAL_HOSTS);
  }
}
