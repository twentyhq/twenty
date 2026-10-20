import { type Lambda } from '@aws-sdk/client-lambda';

import { isLambdaRateLimitError } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/is-lambda-rate-limit-error.util';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export const addLambdaRateLimitErrorMiddleware = (lambdaClient: Lambda) => {
  lambdaClient.middlewareStack.add(
    (next, context) => async (args) => {
      try {
        return await next(args);
      } catch (error) {
        if (isLambdaRateLimitError(error)) {
          throw new LogicFunctionException(
            `Lambda rate limited ${context.commandName ?? 'a request'}`,
            LogicFunctionExceptionCode.LOGIC_FUNCTION_RATE_LIMITED,
          );
        }

        throw error;
      }
    },
    { step: 'initialize', name: 'lambdaRateLimitErrorMiddleware' },
  );
};
