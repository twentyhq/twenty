import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type SdkClientGenerationLambdaFailureCode } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/sdk-client-generation-lambda.type';

const parseLambdaErrorPayload = (payload: string): Record<string, unknown> => {
  try {
    const parsed: unknown = JSON.parse(payload);

    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

// Returns a code, never the error message: it can quote schema text.
export const getSdkClientGenerationLambdaFailureCode = ({
  functionError,
  payload,
}: {
  functionError: string | undefined;
  payload: string | undefined;
}): SdkClientGenerationLambdaFailureCode => {
  if (!isDefined(functionError)) {
    return 'EMPTY_RESPONSE';
  }

  const { errorType, errorMessage } = parseLambdaErrorPayload(payload ?? '');

  if (
    errorType === 'Sandbox.Timedout' ||
    (isString(errorMessage) && errorMessage.includes('Task timed out'))
  ) {
    return 'TIMED_OUT';
  }

  if (errorType === 'Runtime.OutOfMemory') {
    return 'OUT_OF_MEMORY';
  }

  return 'FUNCTION_ERROR';
};
