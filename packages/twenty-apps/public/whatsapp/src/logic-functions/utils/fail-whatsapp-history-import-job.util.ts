import {
  type LogicFunctionExecutionContext,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { getWhatsappHistoryImportError } from 'src/logic-functions/utils/get-whatsapp-history-import-error.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

export const failWhatsappHistoryImportJob = async ({
  error,
  context,
  onFinalFailure,
}: {
  error: unknown;
  context?: Pick<LogicFunctionExecutionContext, 'retryCount' | 'maxRetries'>;
  onFinalFailure: (
    importError: NonNullable<WhatsappHistoryImportState['error']>,
  ) => Promise<void>;
}): Promise<never> => {
  const importError = getWhatsappHistoryImportError(error);

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
