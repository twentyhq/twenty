import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ServerLogicFunctionExecutorExceptionCode {
  FEATURE_DISABLED = 'FEATURE_DISABLED',
  OWNER_WORKSPACE_NOT_SET = 'OWNER_WORKSPACE_NOT_SET',
  FUNCTION_DISABLED = 'FUNCTION_DISABLED',
  APP_NOT_INSTALLED_IN_OWNER_WORKSPACE = 'APP_NOT_INSTALLED_IN_OWNER_WORKSPACE',
  LOGIC_FUNCTION_NOT_FOUND = 'LOGIC_FUNCTION_NOT_FOUND',
  USER_UNCAUGHT_ERROR = 'USER_UNCAUGHT_ERROR',
}

const getServerLogicFunctionExecutorExceptionUserFriendlyMessage = (
  code: ServerLogicFunctionExecutorExceptionCode,
) => {
  switch (code) {
    case ServerLogicFunctionExecutorExceptionCode.FEATURE_DISABLED:
      return msg`Server logic functions are disabled on this instance.`;
    case ServerLogicFunctionExecutorExceptionCode.OWNER_WORKSPACE_NOT_SET:
      return msg`Application registration has no owner workspace.`;
    case ServerLogicFunctionExecutorExceptionCode.FUNCTION_DISABLED:
      return msg`Server logic function is disabled.`;
    case ServerLogicFunctionExecutorExceptionCode.APP_NOT_INSTALLED_IN_OWNER_WORKSPACE:
      return msg`Application is not installed in the owner workspace.`;
    case ServerLogicFunctionExecutorExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
      return msg`Server logic function not found.`;
    case ServerLogicFunctionExecutorExceptionCode.USER_UNCAUGHT_ERROR:
      return msg`Server logic function execution failed.`;
    default:
      assertUnreachable(code);
  }
};

export class ServerLogicFunctionExecutorException extends CustomException<ServerLogicFunctionExecutorExceptionCode> {
  constructor(
    message: string,
    code: ServerLogicFunctionExecutorExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getServerLogicFunctionExecutorExceptionUserFriendlyMessage(code),
    });
  }
}
