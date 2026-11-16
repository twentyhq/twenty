import { type ErrorEvent } from '@sentry/node';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const AI_SDK_ERROR_NAME_PREFIX = 'AI_';

const AI_SDK_ERROR_DIAGNOSTIC_KEYS = [
  'statusCode',
  'isRetryable',
  'reason',
  'url',
];

const removeAiContentFromErrorData = (
  errorName: string,
  errorData: Record<string, unknown>,
): Record<string, unknown> => {
  if (errorName.startsWith(AI_SDK_ERROR_NAME_PREFIX)) {
    return Object.fromEntries(
      Object.entries(errorData).filter(([key]) =>
        AI_SDK_ERROR_DIAGNOSTIC_KEYS.includes(key),
      ),
    );
  }

  if (!isPlainObject(errorData.cause)) {
    return errorData;
  }

  return {
    ...errorData,
    cause: Object.fromEntries(
      Object.entries(errorData.cause).map(([causeName, causeData]) => [
        causeName,
        isPlainObject(causeData)
          ? removeAiContentFromErrorData(causeName, causeData)
          : causeData,
      ]),
    ),
  };
};

export const removeAiContentFromSentryEvent = (
  event: ErrorEvent,
): ErrorEvent => {
  if (!isDefined(event.contexts)) {
    return event;
  }

  const contexts = Object.fromEntries(
    Object.entries(event.contexts).map(([errorName, context]) => [
      errorName,
      isDefined(context)
        ? removeAiContentFromErrorData(errorName, context)
        : context,
    ]),
  );

  return { ...event, contexts };
};
