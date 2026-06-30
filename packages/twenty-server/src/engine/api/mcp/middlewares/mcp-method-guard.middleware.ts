import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';

// MCP streamable-http spec (2025-03-26) requires that servers respond with
// 405 Method Not Allowed (plus an Allow header) for HTTP methods they do not
// support. This middleware runs before guards and controllers so non-POST
// requests are rejected without any authentication overhead.
@Injectable()
export class McpMethodGuardMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST') {
      next();

      return;
    }

    res.setHeader('Allow', 'POST');
    res.status(405).json({
      jsonrpc: '2.0',
      error: {
        code: JSON_RPC_ERROR_CODE.INVALID_REQUEST,
        message: `HTTP method ${req.method} is not allowed. This MCP endpoint only accepts POST requests.`,
      },
      id: null,
    });
  }
}
