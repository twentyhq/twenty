import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { injectWorkspaceBrandingIntoIndexHtml } from './utils/inject-workspace-branding-into-index-html.util';
import {
    isApiPath,
    isStaticAssetPath,
} from './utils/is-static-asset-path.util';
import { WorkspaceBrandingService } from './workspace-branding.service';

@Injectable()
export class WorkspaceBrandingMiddleware implements NestMiddleware {
  constructor(
    private readonly workspaceBrandingService: WorkspaceBrandingService,
  ) {}

  async use(request: Request, response: Response, next: NextFunction) {
    if (request.method !== 'GET' || !this.shouldServeBrandedIndexHtml(request)) {
      return next();
    }

    const indexHtmlTemplate =
      this.workspaceBrandingService.getIndexHtmlTemplate();

    if (!isDefined(indexHtmlTemplate)) {
      return next();
    }

    const branding =
      await this.workspaceBrandingService.getBrandingFromRequest(request);

    const brandedIndexHtml = isDefined(branding)
      ? injectWorkspaceBrandingIntoIndexHtml({
          indexHtml: indexHtmlTemplate,
          displayName: branding.displayName,
          logoUrl: branding.logoUrl,
        })
      : indexHtmlTemplate;

    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.setHeader('Cache-Control', 'public, max-age=60');
    response.send(brandedIndexHtml);
  }

  private shouldServeBrandedIndexHtml(request: Request): boolean {
    const path = request.path;

    if (path === '/favicon.ico') {
      return false;
    }

    if (isStaticAssetPath(path) || isApiPath(path)) {
      return false;
    }

    const acceptHeader = request.headers.accept ?? '';

    if (
      acceptHeader.includes('image/') &&
      !acceptHeader.includes('text/html')
    ) {
      return false;
    }

    return true;
  }
}
