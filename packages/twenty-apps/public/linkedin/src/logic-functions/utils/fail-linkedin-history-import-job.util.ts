import {
  type LogicFunctionExecutionContext,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { getLinkedinHistoryImportError } from 'src/logic-functions/utils/get-linkedin-history-import-error.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

export const failLinkedinHistoryImportJob = async ({
  error,
  context,
  onFinalFailure,
}: {
  error: unknown;
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>;
  onFinalFailure: (
    importError: NonNullable<LinkedinHistoryImportState['error']>,
  ) => Promise<void>;
}): Promise<never> => {
  const importError = getLinkedinHistoryImportError(error);

  if (
    importError.code === 'UNREACHABLE' &&
    isDefined(context) &&
    context.retryCount < context.maxRetries
  ) {
    throw new RetryableLogicFunctionError(importError.message);
  }

  await onFinalFailure(importError);

  throw error instanceof Error ? error : new Error(importError.message);
};
