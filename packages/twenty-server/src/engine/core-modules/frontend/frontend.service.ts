import { Inject, Injectable, Logger } from '@nestjs/common';

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { type NextFunction, type Request, type Response } from 'express';
import { isDefined, normalizeAllowedIframeOrigin } from 'twenty-shared/utils';

import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { isFrontendDocumentRequest } from 'src/engine/core-modules/frontend/utils/is-frontend-document-request.util';
import { renderFrontendHtml } from 'src/engine/core-modules/frontend/utils/render-frontend-html.util';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';

@Injectable()
export class FrontendService {
  private readonly logger = new Logger(FrontendService.name);
  private readonly template: string | undefined;

  constructor(
    private readonly clientConfigService: ClientConfigService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @Inject('FRONTEND_PATH') readonly frontPath: string,
  ) {
    const indexPath = join(this.frontPath, 'index.html');

    if (existsSync(indexPath)) {
      this.template = readFileSync(indexPath, 'utf8');

      if (!this.template.includes('</head>')) {
        throw new Error('Frontend index.html must contain a closing head tag');
      }
    }
  }

  get isEnabled(): boolean {
    return isDefined(this.template);
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
              // A new single-workspace installation has no workspace until signup.
              if (error === WorkspaceNotFoundDefaultError) {
                return { workspace: undefined, isIsolatedOrigin: false };
              }

              throw error;
            }),
        ],
      );

      // Public application domains must never serve the authenticated CRM shell.
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

      // A matching HTML body must not produce a 304 with an outdated framing policy.
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
