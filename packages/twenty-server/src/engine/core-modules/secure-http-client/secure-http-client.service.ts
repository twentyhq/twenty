import { Injectable, Logger } from '@nestjs/common';

import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';

import { createSsrfSafeAgent } from 'src/engine/core-modules/secure-http-client/utils/create-ssrf-safe-agent.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { type OutboundRequestContext } from './outbound-request-context.type';

const MAX_REDIRECTS = 5;

@Injectable()
export class SecureHttpClientService {
  private readonly logger = new Logger(SecureHttpClientService.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  // Returns an SSRF-protected HTTP client for external requests.
  // Protection is enforced at the connection level via custom agents
  // that validate resolved IPs, which covers redirects automatically.
  // When context is provided, outbound requests are logged with
  // workspace/user info for GuardDuty correlation.
  getHttpClient(
    config?: CreateAxiosDefaults,
    context?: OutboundRequestContext,
  ): AxiosInstance {
    const isSafeModeEnabled = this.twentyConfigService.get(
      'OUTBOUND_HTTP_SAFE_MODE_ENABLED',
    );

    const client = isSafeModeEnabled
      ? axios.create({
          ...config,
          httpAgent: createSsrfSafeAgent('http'),
          httpsAgent: createSsrfSafeAgent('https'),
          maxRedirects: Math.min(
            config?.maxRedirects ?? MAX_REDIRECTS,
            MAX_REDIRECTS,
          ),
        })
      : axios.create(config);

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

  // Returns a plain HTTP client for requests to trusted internal URLs
  // (e.g., the server's own API endpoints). Not SSRF-protected.
  getInternalHttpClient(config?: CreateAxiosDefaults): AxiosInstance {
    return axios.create(config);
  }
}
