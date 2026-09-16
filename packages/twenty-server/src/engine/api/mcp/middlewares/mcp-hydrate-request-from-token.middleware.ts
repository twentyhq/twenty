import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

/**
 * Soft-hydrate workspace onto MCP requests before APP_GUARD.
 * Auth failures are left to McpAuthGuard (WWW-Authenticate); we never write
 * a GraphQL/REST error body here.
 */
@Injectable()
export class McpHydrateRequestFromTokenMiddleware implements NestMiddleware {
  constructor(private readonly middlewareService: MiddlewareService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      await this.middlewareService.hydrateGraphqlRequest(req);
    } catch {
      // Token validation belongs to McpAuthGuard.
    }

    next();
  }
}
