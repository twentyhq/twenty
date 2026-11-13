import * as http from 'http';

import { Injectable, Logger } from '@nestjs/common';

import { type Counter } from '@opentelemetry/api';
import axios, {
  type AxiosAdapter,
  type AxiosInstance,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from 'axios';
import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { buildAxiosFetch } from '@lifeomic/axios-fetch';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type OutboundRequestOutcomeDetails } from 'src/engine/core-modules/secure-http-client/outbound-request-outcome-details.type';
import { type SecureHttpClientConfig } from 'src/engine/core-modules/secure-http-client/secure-http-client-config.type';
import { createSsrfSafeAgent } from 'src/engine/core-modules/secure-http-client/utils/create-ssrf-safe-agent.util';
import { createSsrfSafeAxiosClient } from 'src/engine/core-modules/secure-http-client/utils/create-ssrf-safe-axios-client.util';
import { describeOutboundRequestError } from 'src/engine/core-modules/secure-http-client/utils/describe-outbound-request-error.util';
import { redactOutboundRequestUrl } from 'src/engine/core-modules/secure-http-client/utils/redact-outbound-request-url.util';
import { ALLOW_ALL_INTERNAL_HOSTS } from 'src/engine/core-modules/secure-http-client/constants/allow-all-internal-hosts.constant';
import { normalizeAllowedInternalHost } from 'src/engine/core-modules/secure-http-client/utils/normalize-allowed-internal-host.util';
import { resolveAndValidateHostname } from 'src/engine/core-modules/secure-http-client/utils/resolve-and-validate-hostname.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { type OutboundRequestContext } from './outbound-request-context.type';

type LogAttributes = Record<string, string | number | undefined>;

const formatLogAttributes = (attributes: LogAttributes): string =>
  Object.entries(attributes)
    .filter(([, value]) => isNumber(value) || isNonEmptyString(value))
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

const getRequestUri = (requestConfig: InternalAxiosRequestConfig): string => {
  try {
    return axios.getUri(requestConfig);
  } catch {
    return '';
  }
};

const parseUrl = (url: string): URL | undefined => {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
};

const buildRequestLogAttributes = ({
  method,
  url,
  context,
}: {
  method: string;
  url: string;
  context: OutboundRequestContext;
}): LogAttributes => {
  const requestUrl = parseUrl(url);

  return {
    method,
    host: requestUrl?.hostname,
    url: isDefined(requestUrl)
      ? redactOutboundRequestUrl(requestUrl)
      : undefined,
    ...getContextLogAttributes(context),
  };
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
    const { shouldRestrictToPublicHosts, ...clientConfig } = config ?? {};

    const client = createSsrfSafeAxiosClient({
      config: clientConfig,
      allowedInternalHosts: shouldRestrictToPublicHosts
        ? []
        : this.getAllowedInternalHosts(),
    });

    if (isDefined(context)) {
      client.defaults.adapter = this.buildLoggingAdapter({
        adapter: axios.getAdapter(client.defaults.adapter),
        context,
      });
    }

    return client;
  }

  // For requests that may run outside this process (the HTTP egress Lambda), so they log the same lines as the adapter.
  recordRequest({
    method,
    url,
    context,
  }: {
    method: string;
    url: string;
    context: OutboundRequestContext;
  }): void {
    this.logRequest(buildRequestLogAttributes({ method, url, context }));
  }

  recordRequestOutcome({
    method,
    url,
    context,
    outcomeDetails,
  }: {
    method: string;
    url: string;
    context: OutboundRequestContext;
    outcomeDetails: OutboundRequestOutcomeDetails;
  }): void {
    this.recordOutcome({
      context,
      outcomeDetails,
      requestAttributes: buildRequestLogAttributes({ method, url, context }),
    });
  }

  // An adapter rather than interceptors: retries get one line per attempt and protocol refusals are logged too
  private buildLoggingAdapter({
    adapter,
    context,
  }: {
    adapter: AxiosAdapter;
    context: OutboundRequestContext;
  }): AxiosAdapter {
    return async (requestConfig: InternalAxiosRequestConfig) => {
      const requestAttributes = buildRequestLogAttributes({
        method: requestConfig.method?.toUpperCase() ?? 'GET',
        url: getRequestUri(requestConfig),
        context,
      });

      this.logRequest(requestAttributes);

      const startedAt = Date.now();

      try {
        const response = await adapter(requestConfig);

        this.recordOutcome({
          context,
          outcomeDetails: {
            outcome: 'success',
            status: response.status,
            durationMs: Date.now() - startedAt,
          },
          requestAttributes,
        });

        return response;
      } catch (error) {
        this.recordOutcome({
          context,
          outcomeDetails: {
            ...describeOutboundRequestError(error),
            durationMs: Date.now() - startedAt,
          },
          requestAttributes,
        });

        throw error;
      }
    };
  }

  private logRequest(requestAttributes: LogAttributes): void {
    this.logger.log(
      `Outbound HTTP request: ${formatLogAttributes(requestAttributes)}`,
    );
  }

  private recordOutcome({
    context,
    outcomeDetails: { outcome, status, durationMs, errorCode, reason },
    requestAttributes,
  }: {
    context: OutboundRequestContext;
    outcomeDetails: OutboundRequestOutcomeDetails;
    requestAttributes: LogAttributes;
  }): void {
    this.outboundRequestCounter.add(1, { source: context.source, outcome });

    const message = `Outbound HTTP outcome: ${formatLogAttributes({
      outcome,
      status,
      durationMs,
      errorCode,
      reason: isDefined(reason) ? JSON.stringify(reason) : undefined,
      ...requestAttributes,
    })}`;

    if (outcome === 'blocked') {
      this.logger.warn(message);

      return;
    }

    this.logger.log(message);
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

  createFetchLike({
    context,
    timeoutMs,
  }: {
    context: OutboundRequestContext;
    timeoutMs: number;
  }): FetchLike {
    const axiosFetch = buildAxiosFetch(
      this.getHttpClient({ timeout: timeoutMs }, context),
      (config, _input, init) =>
        init?.redirect === 'manual' ? { ...config, maxRedirects: 0 } : config,
    );

    return (url, init) => axiosFetch(url.toString(), init);
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
