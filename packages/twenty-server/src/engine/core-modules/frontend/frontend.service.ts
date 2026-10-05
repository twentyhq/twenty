import { Inject, Injectable, Logger } from '@nestjs/common';

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { type ReadableStream } from 'stream/web';

import { type NextFunction, type Request, type Response } from 'express';
import { isDefined, normalizeAllowedIframeOrigin } from 'twenty-shared/utils';

import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { isFrontendDocumentRequest } from 'src/engine/core-modules/frontend/utils/is-frontend-document-request.util';
import { renderFrontendHtml } from 'src/engine/core-modules/frontend/utils/render-frontend-html.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

const MAX_FRONTEND_HTML_SIZE_BYTES = 1024 * 1024;

@Injectable()
export class FrontendService {
  private readonly logger = new Logger(FrontendService.name);
  private readonly template: string | undefined;
  private readonly indexUrl: string | undefined;

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

      this.validateTemplate(this.template);
    }
  }

  get isEnabled(): boolean {
    return isDefined(this.template) || isDefined(this.indexUrl);
  }

  private validateTemplate(template: string): void {
    if (!template.includes('</head>')) {
      throw new Error('Frontend index.html must contain a closing head tag');
    }
  }

  private async getTemplate(): Promise<string> {
    if (!isDefined(this.indexUrl)) {
      if (!isDefined(this.template)) {
        throw new Error('Frontend HTML is not configured');
      }

      return this.template;
    }

    const response = await fetch(this.indexUrl, {
      signal: AbortSignal.timeout(5_000),
      redirect: 'error',
    });

    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`Unable to fetch frontend HTML: HTTP ${response.status}`);
    }

    if (!isDefined(response.body)) {
      throw new Error('Frontend index.html must have a response body');
    }

    const template = (
      await streamToBuffer(
        Readable.fromWeb(response.body as ReadableStream<Uint8Array>),
        MAX_FRONTEND_HTML_SIZE_BYTES,
      )
    ).toString('utf8');

    this.validateTemplate(template);

    return template;
  }

  async serveDocument(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    if (!this.isEnabled || !isFrontendDocumentRequest(request)) {
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
      const { workspace, isIsolatedOrigin } = await this.workspaceDomainsService
        .resolveWorkspaceAndPublicDomain(getRequestBaseUrl(request))
        .catch((error: unknown) => {
          if (error === WorkspaceNotFoundDefaultError) {
            return { workspace: undefined, isIsolatedOrigin: false };
          }

          throw error;
        });

      if (isIsolatedOrigin) {
        response.status(404).end();

        return;
      }

      const [template, clientConfig] = await Promise.all([
        this.getTemplate(),
        this.clientConfigService.getClientConfig(),
      ]);

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

      response.type('html').end(renderFrontendHtml(template, clientConfig));
    } catch (error) {
      this.logger.error('Unable to serve frontend document', error);
      response
        .status(503)
        .type('text')
        .send('Unable to load Twenty. Please try again.');
    }
  }
}
