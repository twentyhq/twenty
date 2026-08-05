import { isNonEmptyString } from '@sniptt/guards';

import { DEPENDENCIES_SIZE_EXCEEDED_ERROR_NAME } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

type YarnInstallLambdaErrorPayload = {
  errorType?: string;
  errorMessage?: string;
};

export const buildYarnInstallFailureException = (
  payload: YarnInstallLambdaErrorPayload,
): LogicFunctionException => {
  if (
    payload.errorType === DEPENDENCIES_SIZE_EXCEEDED_ERROR_NAME &&
    isNonEmptyString(payload.errorMessage)
  ) {
    return new LogicFunctionException(
      payload.errorMessage,
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
    );
  }

  // An OOM kill means the tree is far beyond what a layer can hold
  if (payload.errorType === 'Runtime.OutOfMemory') {
    return new LogicFunctionException(
      `Yarn install Lambda ran out of memory: the dependency tree is too large to install`,
      LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
    );
  }

  return new LogicFunctionException(
    `Yarn install Lambda failed: ${JSON.stringify(payload)}`,
    LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
  );
};
