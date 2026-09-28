import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
} from '@nestjs/common';

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { type NextFunction, type Request, type Response } from 'express';
import { isDefined, normalizeAllowedIframeOrigin } from 'twenty-shared/utils';

import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { isFrontendDocumentRequest } from 'src/engine/core-modules/frontend/utils/is-frontend-document-request.util';
import { renderFrontendHtml } from 'src/engine/core-modules/frontend/utils/render-frontend-html.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';

@Injectable()
export class FrontendService implements OnModuleDestroy {
  private readonly logger = new Logger(FrontendService.name);
  private template: string | undefined;
  private readonly indexUrl: string | undefined;
  private refreshInterval: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly clientConfigService: ClientConfigService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @Inject('FRONTEND_PATH') readonly frontPath: string,
    twentyConfigService: TwentyConfigService,
  ) {
    this.indexUrl = twentyConfigService.get('FRONTEND_INDEX_URL');

    if (isDefined(this.indexUrl)) {
      return;
    }

    const indexPath = join(this.frontPath, 'index.html');

    if (existsSync(indexPath)) {
      this.template = readFileSync(indexPath, 'utf8');

      if (!this.template.includes('</head>')) {
        throw new Error('Frontend index.html must contain a closing head tag');
      }
    }
  }

  get isEnabled(): boolean {
    return isDefined(this.template) || isDefined(this.indexUrl);
  }

  async initialize(): Promise<void> {
    if (!isDefined(this.indexUrl)) {
      return;
    }

    await this.refreshTemplate(this.indexUrl);

    const indexUrl = this.indexUrl;

    this.refreshInterval = setInterval(() => {
      void this.refreshTemplate(indexUrl).catch((error: unknown) => {
        this.logger.warn(
          'Unable to refresh frontend HTML; retaining last template',
          error,
        );
      });
    }, 60_000);
    this.refreshInterval.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  private async refreshTemplate(indexUrl: string): Promise<void> {
    const response = await fetch(indexUrl, {
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      throw new Error(`Unable to fetch frontend HTML: HTTP ${response.status}`);
    }

    const template = await response.text();

    if (!template.includes('</head>')) {
      throw new Error('Frontend index.html must contain a closing head tag');
    }

    this.template = template;
  }

  async serveDocument(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    if (!isDefined(this.template) || !isFrontendDocumentRequest(request)) {
      next();

      return;
    }

    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('CDN-Cache-Control', 'no-store');
    response.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'SAMEORIGIN');
    response.setHeader(
      'Content-Security-Policy',
      "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
    );

    try {
      const [clientConfig, { workspace, isIsolatedOrigin }] = await Promise.all(
        [
          this.clientConfigService.getClientConfig(),
          this.workspaceDomainsService
            .resolveWorkspaceAndPublicDomain(getRequestBaseUrl(request))
            .catch((error: unknown) => {
              if (error === WorkspaceNotFoundDefaultError) {
                return { workspace: undefined, isIsolatedOrigin: false };
              }

              throw error;
            }),
        ],
      );

      if (isIsolatedOrigin) {
        response.status(404).end();

        return;
      }

      const allowedOrigins = (workspace?.allowedIframeOrigins ?? [])
        .map(normalizeAllowedIframeOrigin)
        .filter(isDefined);

      if (allowedOrigins.length > 0) {
        response.setHeader(
          'Content-Security-Policy',
          `frame-ancestors 'self' ${[...new Set(allowedOrigins)].join(' ')}; object-src 'none'; base-uri 'self'`,
        );
        response.removeHeader('X-Frame-Options');
      }

      response
        .type('html')
        .end(renderFrontendHtml(this.template, clientConfig));
    } catch (error) {
      this.logger.error('Unable to serve frontend document', error);
      response
        .status(503)
        .type('text')
        .send('Unable to load Twenty. Please try again.');
    }
  }
}
