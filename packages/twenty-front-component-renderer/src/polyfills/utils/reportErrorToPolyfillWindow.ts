import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const UNHANDLED_SANDBOX_ERROR_MESSAGE =
  '[twenty-front-component] An error reported inside the front component sandbox was not handled.';

const UNRESOLVABLE_ERROR_MESSAGE =
  '[twenty-front-component] The reported value could not be converted to a message.';

const resolveErrorMessage = (error: unknown): string => {
  try {
    return error instanceof Error ? error.message : String(error);
  } catch {
    return UNRESOLVABLE_ERROR_MESSAGE;
  }
};

type PolyfillErrorEvent = {
  defaultPrevented: boolean;
};

type PolyfillErrorEventConstructor = new (
  type: string,
  eventInitDict: {
    message?: string;
    error?: unknown;
    cancelable?: boolean;
  },
) => PolyfillErrorEvent;

type ReportErrorToPolyfillWindowInput = {
  polyfillWindow: Record<string, unknown> | null;
  error: unknown;
};

export const reportErrorToPolyfillWindow = ({
  polyfillWindow,
  error,
}: ReportErrorToPolyfillWindowInput): void => {
  const ErrorEventConstructor = polyfillWindow?.ErrorEvent;
  const dispatchEvent = polyfillWindow?.dispatchEvent;

  if (
    isDefined(polyfillWindow) &&
    isFunction(ErrorEventConstructor) &&
    isFunction(dispatchEvent)
  ) {
    const errorEvent =
      new (ErrorEventConstructor as PolyfillErrorEventConstructor)('error', {
        message: resolveErrorMessage(error),
        error,
        cancelable: true,
      });

    dispatchEvent.call(polyfillWindow, errorEvent);

    if (errorEvent.defaultPrevented) {
      return;
    }
  }

  console.error(UNHANDLED_SANDBOX_ERROR_MESSAGE, error);
};
