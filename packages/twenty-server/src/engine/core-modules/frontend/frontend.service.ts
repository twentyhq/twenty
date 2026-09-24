import { Inject, Injectable, Logger } from '@nestjs/common';

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import { type NextFunction, type Request, type Response } from 'express';
import { PAYMENT_FRAME_PATH } from 'twenty-shared/constants';
import { isDefined, normalizeAllowedIframeOrigin } from 'twenty-shared/utils';

import { ClientConfigService } from 'src/engine/core-modules/client-config/services/client-config.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { buildPaymentFrameAncestors } from 'src/engine/core-modules/frontend/utils/build-payment-frame-ancestors.util';
import { isFrontendDocumentRequest } from 'src/engine/core-modules/frontend/utils/is-frontend-document-request.util';
import { renderFrontendHtml } from 'src/engine/core-modules/frontend/utils/render-frontend-html.util';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';

@Injectable()
export class FrontendService {
  private readonly logger = new Logger(FrontendService.name);
  private readonly template: string | undefined;
  private readonly paymentFrameDocument: string | undefined;

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

    const paymentFramePath = join(this.frontPath, PAYMENT_FRAME_PATH);

    if (existsSync(paymentFramePath)) {
      this.paymentFrameDocument = readFileSync(paymentFramePath, 'utf8');
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

    this.setDocumentHeaders(response, "'self'");
    response.setHeader('X-Frame-Options', 'SAMEORIGIN');

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
        this.setFrameAncestors(
          response,
          `'self' ${[...new Set(allowedOrigins)].join(' ')}`,
        );
        response.removeHeader('X-Frame-Options');
      }

      response
        .type('html')
        .end(renderFrontendHtml(this.template, clientConfig));
    } catch (error) {
      this.sendUnavailable(response, error);
    }
  }

  async servePaymentFrame(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    if (
      !isDefined(this.paymentFrameDocument) ||
      (request.method !== 'GET' && request.method !== 'HEAD')
    ) {
      next();

      return;
    }

    this.setDocumentHeaders(response, "'none'");

    try {
      const clientConfig = await this.clientConfigService.getClientConfig();

      this.setFrameAncestors(
        response,
        buildPaymentFrameAncestors({
          requestBaseUrl: getRequestBaseUrl(request),
          clientConfig,
        }),
      );
      response.type('html').end(this.paymentFrameDocument);
    } catch (error) {
      this.sendUnavailable(response, error);
    }
  }

  private setDocumentHeaders(response: Response, frameAncestors: string) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('CDN-Cache-Control', 'no-store');
    response.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    this.setFrameAncestors(response, frameAncestors);
  }

  private setFrameAncestors(response: Response, frameAncestors: string) {
    response.setHeader(
      'Content-Security-Policy',
      `frame-ancestors ${frameAncestors}; object-src 'none'; base-uri 'self'`,
    );
  }

  private sendUnavailable(response: Response, error: unknown) {
    this.logger.error('Unable to serve frontend document', error);
    response
      .status(503)
      .type('text')
      .send('Unable to load Twenty. Please try again.');
  }
}
