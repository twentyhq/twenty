import { type ErrorEvent } from '@sentry/node';
import { isDefined } from 'twenty-shared/utils';

const AI_SDK_ERROR_NAME_PREFIX = 'AI_';

const AI_SDK_ERROR_DIAGNOSTIC_KEYS = [
  'statusCode',
  'isRetryable',
  'reason',
  'url',
];

// extraErrorDataIntegration copies every error property into contexts, including prompts and model output
export const removeAiContentFromSentryEvent = (
  event: ErrorEvent,
): ErrorEvent => {
  if (!isDefined(event.contexts)) {
    return event;
  }

  const contexts = Object.fromEntries(
    Object.entries(event.contexts).map(([errorName, context]) => [
      errorName,
      errorName.startsWith(AI_SDK_ERROR_NAME_PREFIX) && isDefined(context)
        ? Object.fromEntries(
            Object.entries(context).filter(([key]) =>
              AI_SDK_ERROR_DIAGNOSTIC_KEYS.includes(key),
            ),
          )
        : context,
    ]),
  );

  return { ...event, contexts };
};
