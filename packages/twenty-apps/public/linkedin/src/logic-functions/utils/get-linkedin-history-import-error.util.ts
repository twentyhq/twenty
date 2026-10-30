import { isNumber, isObject, isString } from '@sniptt/guards';
import { AppConnectionAuthFailedError } from 'twenty-sdk/logic-function';

import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const TRANSIENT_HTTP_STATUSES = [429, 500, 502, 503, 504];

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

export const getLinkedinHistoryImportError = (
  error: unknown,
): NonNullable<LinkedinHistoryImportState['error']> => {
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

  if (
    (error instanceof Error &&
      (error.name === 'TypeError' || error.name === 'AbortError')) ||
    (isNumber(status) && TRANSIENT_HTTP_STATUSES.includes(status))
  ) {
    return { code: 'UNREACHABLE', message };
  }

  return { code: 'UNKNOWN', message };
};
