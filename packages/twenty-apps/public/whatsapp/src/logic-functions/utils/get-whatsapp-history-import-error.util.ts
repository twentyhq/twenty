import { isObject, isString } from '@sniptt/guards';
import { AppConnectionAuthFailedError } from 'twenty-sdk/logic-function';

import { isTransientWhatsappError } from 'src/logic-functions/utils/is-transient-whatsapp-error.util';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (isObject(error)) {
    const { detail, title } = error as { detail?: unknown; title?: unknown };

    if (isString(detail)) {
      return detail;
    }

    if (isString(title)) {
      return title;
    }
  }

  return String(error);
};

export const getWhatsappHistoryImportError = (
  error: unknown,
): NonNullable<WhatsappHistoryImportState['error']> => {
  const message = getErrorMessage(error);
  const status = isObject(error)
    ? (error as { status?: unknown }).status
    : undefined;

  if (
    error instanceof AppConnectionAuthFailedError ||
    status === 401 ||
    status === 403
  ) {
    return { code: 'AUTH_FAILED', message };
  }

  if (isTransientWhatsappError(error)) {
    return { code: 'UNREACHABLE', message };
  }

  return { code: 'UNKNOWN', message };
};
