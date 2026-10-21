import { HttpException } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import {
  McpException,
  McpExceptionCode,
} from 'src/engine/api/mcp/exceptions/mcp.exception';
import { type JsonRpcError } from 'src/engine/api/mcp/types/json-rpc-error.type';
import { CustomException } from 'src/utils/custom-exception';

const getJsonRpcErrorCode = (code: keyof typeof McpExceptionCode) => {
  switch (code) {
    case McpExceptionCode.METHOD_NOT_FOUND:
      return JSON_RPC_ERROR_CODE.METHOD_NOT_FOUND;
    case McpExceptionCode.INVALID_PARAMS:
      return JSON_RPC_ERROR_CODE.INVALID_PARAMS;
    case McpExceptionCode.FORBIDDEN:
      return JSON_RPC_ERROR_CODE.SERVER_ERROR;
    default:
      return assertUnreachable(code);
  }
};

export const buildJsonRpcError = (exception: Error): JsonRpcError => {
  if (exception instanceof McpException) {
    return {
      code: getJsonRpcErrorCode(exception.code),
      message: exception.message,
    };
  }

  if (exception instanceof HttpException) {
    return {
      code: JSON_RPC_ERROR_CODE.SERVER_ERROR,
      message: exception.message || 'Request failed',
    };
  }

  return {
    code: JSON_RPC_ERROR_CODE.INTERNAL_ERROR,
    message:
      exception instanceof CustomException
        ? exception.message
        : 'Internal server error',
  };
};
