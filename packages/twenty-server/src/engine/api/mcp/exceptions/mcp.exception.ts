import { HttpStatus } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export const McpExceptionCode = {
  METHOD_NOT_FOUND: 'METHOD_NOT_FOUND',
  INVALID_PARAMS: 'INVALID_PARAMS',
  FORBIDDEN: 'FORBIDDEN',
} as const;

const getMcpExceptionUserFriendlyMessage = (
  code: keyof typeof McpExceptionCode,
) => {
  switch (code) {
    case McpExceptionCode.METHOD_NOT_FOUND:
      return msg`This MCP method is not supported.`;
    case McpExceptionCode.INVALID_PARAMS:
      return msg`The MCP request parameters are invalid.`;
    case McpExceptionCode.FORBIDDEN:
      return msg`You are not allowed to use MCP.`;
    default:
      return assertUnreachable(code);
  }
};

const getMcpExceptionStatusCode = (code: keyof typeof McpExceptionCode) => {
  switch (code) {
    case McpExceptionCode.METHOD_NOT_FOUND:
      return HttpStatus.NOT_FOUND;
    case McpExceptionCode.INVALID_PARAMS:
      return HttpStatus.BAD_REQUEST;
    case McpExceptionCode.FORBIDDEN:
      return HttpStatus.FORBIDDEN;
    default:
      return assertUnreachable(code);
  }
};

export class McpException extends CustomException<
  keyof typeof McpExceptionCode
> {
  constructor(message: string, code: keyof typeof McpExceptionCode) {
    super(message, code, {
      userFriendlyMessage: getMcpExceptionUserFriendlyMessage(code),
      // Never sent as an HTTP status: it keeps handleException from reporting these to Sentry
      statusCode: getMcpExceptionStatusCode(code),
    });
  }
}
