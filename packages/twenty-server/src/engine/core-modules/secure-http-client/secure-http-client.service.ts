import * as http from 'http';

import { Injectable, Logger } from '@nestjs/common';

import { type Counter } from '@opentelemetry/api';
import axios, {
  type AxiosAdapter,
  type AxiosInstance,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';
import axiosRetry from 'axios-retry';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { buildAxiosFetch } from '@lifeomic/axios-fetch';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { OutboundRequestBlockedError } from 'src/engine/core-modules/secure-http-client/errors/outbound-request-blocked.error';
import { type OutboundRequestOutcome } from 'src/engine/core-modules/secure-http-client/outbound-request-outcome.type';
import { createSsrfSafeAgent } from 'src/engine/core-modules/secure-http-client/utils/create-ssrf-safe-agent.util';
import { findOutboundRequestBlockedError } from 'src/engine/core-modules/secure-http-client/utils/find-outbound-request-blocked-error.util';
import { getOutboundRequestOutcome } from 'src/engine/core-modules/secure-http-client/utils/get-outbound-request-outcome.util';
import { redactOutboundRequestUrl } from 'src/engine/core-modules/secure-http-client/utils/redact-outbound-request-url.util';
import { ALLOW_ALL_INTERNAL_HOSTS } from 'src/engine/core-modules/secure-http-client/constants/allow-all-internal-hosts.constant';
import { OUTBOUND_HTTP_DEFAULT_MAX_PAYLOAD_SIZE_BYTES } from 'src/engine/core-modules/secure-http-client/constants/outbound-http-default-max-payload-size-bytes.constant';
import { OUTBOUND_HTTP_DEFAULT_TIMEOUT_MS } from 'src/engine/core-modules/secure-http-client/constants/outbound-http-default-timeout-ms.constant';
import { normalizeAllowedInternalHost } from 'src/engine/core-modules/secure-http-client/utils/normalize-allowed-internal-host.util';
import { resolveAndValidateHostname } from 'src/engine/core-modules/secure-http-client/utils/resolve-and-validate-hostname.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { type OutboundRequestContext } from './outbound-request-context.type';
import { type OutboundRequestSource } from './outbound-request-source.type';

const MAX_REDIRECTS = 5;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

type SecureHttpClientConfig = CreateAxiosDefaults & {
  retries?: number;
  shouldResetTimeout?: boolean;
};

type LogAttributes = Record<string, string | number | undefined>;

const formatLogAttributes = (attributes: LogAttributes): string =>
  Object.entries(attributes)
    .filter(([, value]) => isDefined(value) && value !== '')
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

const getContextLogAttributes = (
  context: OutboundRequestContext,
): LogAttributes => ({
  workspace: context.workspaceId,
  source: context.source,
  user: context.userId,
  userWorkspace: context.userWorkspaceId,
  workspaceMember: context.workspaceMemberId,
  workflowRun: context.workflowRunId,
  workflowStep: context.workflowStepId,
});

const parseRequestUrl = (
  requestConfig: InternalAxiosRequestConfig,
): URL | undefined => {
  try {
    return new URL(axios.getUri(requestConfig));
  } catch {
    return undefined;
  }
};

@Injectable()
export class SecureHttpClientService {
  private readonly logger = new Logger(SecureHttpClientService.name);
  private readonly outboundRequestCounter: Counter;
  private hasWarnedAboutDeprecatedSafeModeFlag = false;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    metricsService: MetricsService,
  ) {
    this.outboundRequestCounter = metricsService
      .getMeter()
      .createCounter('twenty_outbound_http_requests', {
        description:
          'Outbound HTTP requests made on behalf of a workspace, by source and outcome',
      });
  }

  // SSRF protection is enforced at connection level by validating resolved IPs, which also covers redirects.
  // With a context, each attempt is logged before it is sent and again with its outcome.
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

    client.defaults.adapter = this.buildAdapter({
      adapter: axios.getAdapter(client.defaults.adapter),
      isSafeModeEnabled,
      context,
    });

    client.interceptors.request.use((requestConfig) => {
      requestConfig.signal = AbortSignal.timeout(
        requestConfig.timeout || OUTBOUND_HTTP_DEFAULT_TIMEOUT_MS,
      );

      return requestConfig;
    });

    if (isDefined(retries) && retries > 0) {
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
  }

  // An adapter rather than interceptors: retries get one line per attempt and protocol refusals are logged too
  private buildAdapter({
    adapter,
    isSafeModeEnabled,
    context,
  }: {
    adapter: AxiosAdapter;
    isSafeModeEnabled: boolean;
    context?: OutboundRequestContext;
  }): AxiosAdapter {
    const guardedAdapter: AxiosAdapter = isSafeModeEnabled
      ? async (requestConfig) => {
          this.assertAllowedProtocol(requestConfig);

          return adapter(requestConfig);
        }
      : adapter;

    if (!isDefined(context)) {
      return guardedAdapter;
    }

    return async (requestConfig) => {
      const requestUrl = parseRequestUrl(requestConfig);
      const requestAttributes: LogAttributes = {
        method: requestConfig.method?.toUpperCase() ?? 'GET',
        host: requestUrl?.hostname,
        url: isDefined(requestUrl)
          ? redactOutboundRequestUrl(requestUrl)
          : undefined,
        ...getContextLogAttributes(context),
      };

      this.logger.log(
        `Outbound HTTP request: ${formatLogAttributes(requestAttributes)}`,
      );

      const startedAt = Date.now();

      try {
        const response = await guardedAdapter(requestConfig);

        this.recordOutcome({
          source: context.source,
          outcomeAttributes: {
            outcome: 'success',
            status: response.status,
            durationMs: Date.now() - startedAt,
          },
          requestAttributes,
        });

        return response;
      } catch (error) {
        const outcome = getOutboundRequestOutcome(error);

        this.recordOutcome({
          source: context.source,
          outcomeAttributes: {
            outcome,
            status: isAxiosError(error) ? error.response?.status : undefined,
            durationMs: Date.now() - startedAt,
            errorCode:
              isAxiosError(error) && !isDefined(error.response)
                ? error.code
                : undefined,
            reason:
              outcome === 'blocked'
                ? JSON.stringify(
                    findOutboundRequestBlockedError(error)?.message,
                  )
                : undefined,
          },
          requestAttributes,
        });

        throw error;
      }
    };
  }

  private recordOutcome({
    source,
    outcomeAttributes,
    requestAttributes,
  }: {
    source: OutboundRequestSource;
    outcomeAttributes: LogAttributes & { outcome: OutboundRequestOutcome };
    requestAttributes: LogAttributes;
  }): void {
    const { outcome } = outcomeAttributes;

    this.outboundRequestCounter.add(1, { source, outcome });

    const message = `Outbound HTTP outcome: ${formatLogAttributes({
      ...outcomeAttributes,
      ...requestAttributes,
    })}`;

    if (outcome === 'blocked') {
      this.logger.warn(message);

      return;
    }

    this.logger.log(message);
  }

  private assertAllowedProtocol(
    requestConfig: InternalAxiosRequestConfig,
  ): void {
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
  }

  // Not SSRF-protected: trusted internal URLs only.
  getInternalHttpClient(config?: CreateAxiosDefaults): AxiosInstance {
    return axios.create(config);
  }

  createSsrfSafeFetch(): typeof globalThis.fetch {
    if (!this.isSafeModeEnabled(this.getAllowedInternalHosts())) {
      return globalThis.fetch;
    }

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
