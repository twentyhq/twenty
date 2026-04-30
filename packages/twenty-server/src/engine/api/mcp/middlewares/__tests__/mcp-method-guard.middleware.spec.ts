import { type Request, type Response } from 'express';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import { McpMethodGuardMiddleware } from 'src/engine/api/mcp/middlewares/mcp-method-guard.middleware';

describe('McpMethodGuardMiddleware', () => {
  let middleware: McpMethodGuardMiddleware;
  let mockRes: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    middleware = new McpMethodGuardMiddleware();
    next = jest.fn();
    mockRes = {
      setHeader: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should call next() for POST requests', () => {
    const req = { method: 'POST' } as Request;

    middleware.use(req, mockRes as Response, next);

    expect(next).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 405 with Allow header for GET requests', () => {
    const req = { method: 'GET' } as Request;

    middleware.use(req, mockRes as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      error: {
        code: JSON_RPC_ERROR_CODE.INVALID_REQUEST,
        message:
          'HTTP method GET is not allowed. This MCP endpoint only accepts POST requests.',
      },
      id: null,
    });
  });

  it('should return 405 with Allow header for DELETE requests', () => {
    const req = { method: 'DELETE' } as Request;

    middleware.use(req, mockRes as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockRes.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      error: {
        code: JSON_RPC_ERROR_CODE.INVALID_REQUEST,
        message:
          'HTTP method DELETE is not allowed. This MCP endpoint only accepts POST requests.',
      },
      id: null,
    });
  });

  it('should return 405 for PUT requests', () => {
    const req = { method: 'PUT' } as Request;

    middleware.use(req, mockRes as Response, next);

    expect(next).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(405);
  });
});
