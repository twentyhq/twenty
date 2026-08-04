import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const UNHANDLED_SANDBOX_ERROR_MESSAGE =
  '[twenty-front-component] An error reported inside the front component sandbox was not handled.';

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
        message: error instanceof Error ? error.message : String(error),
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
