import { ForbiddenException } from '@nestjs/common';

import {
  McpException,
  McpExceptionCode,
} from 'src/engine/api/mcp/exceptions/mcp.exception';
import { buildJsonRpcError } from 'src/engine/api/mcp/utils/build-json-rpc-error.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('buildJsonRpcError', () => {
  it.each([
    [McpExceptionCode.METHOD_NOT_FOUND, -32601],
    [McpExceptionCode.INVALID_PARAMS, -32602],
    [McpExceptionCode.FORBIDDEN, -32000],
  ])('should map the %s MCP exception to code %p', (code, jsonRpcCode) => {
    expect(buildJsonRpcError(new McpException('Refused', code))).toEqual({
      code: jsonRpcCode,
      message: 'Refused',
    });
  });

  it('should return the message of an HTTP exception as a server error', () => {
    expect(
      buildJsonRpcError(new ForbiddenException('Workspace suspended')),
    ).toEqual({ code: -32000, message: 'Workspace suspended' });
  });

  it('should return the message of a domain exception as an internal error', () => {
    expect(
      buildJsonRpcError(
        new PermissionsException(
          'User workspace not found',
          PermissionsExceptionCode.USER_WORKSPACE_NOT_FOUND,
        ),
      ),
    ).toEqual({ code: -32603, message: 'User workspace not found' });
  });

  it('should hide the message of an unexpected error', () => {
    expect(
      buildJsonRpcError(new TypeError('Cannot read properties of undefined')),
    ).toEqual({ code: -32603, message: 'Internal server error' });
  });
});
