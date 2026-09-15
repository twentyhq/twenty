import { isDefined } from 'twenty-shared/utils';

type PolyfillEventTarget = {
  dispatchEvent: (event: object) => boolean;
};

type PolyfillErrorEventConstructor = new (
  type: string,
  eventInitDict: {
    message?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    error?: unknown;
  },
) => object;

type PolyfillPromiseRejectionEventConstructor = new (
  type: string,
  eventInitDict: { reason?: unknown; promise?: Promise<unknown> },
) => object;

type NativeErrorEvent = {
  message?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: unknown;
};

type NativePromiseRejectionEvent = {
  reason?: unknown;
  promise?: Promise<unknown>;
};

type ErrorEventBridgeScope = {
  window?: PolyfillEventTarget;
  ErrorEvent?: PolyfillErrorEventConstructor;
  PromiseRejectionEvent?: PolyfillPromiseRejectionEventConstructor;
  addEventListener: (
    type: string,
    listener: (event: NativeErrorEvent & NativePromiseRejectionEvent) => void,
  ) => void;
};

export const installErrorEventBridge = (
  globalScope: ErrorEventBridgeScope = globalThis as unknown as ErrorEventBridgeScope,
): void => {
  const polyfillWindow = globalScope.window;

  if (
    !isDefined(polyfillWindow) ||
    (polyfillWindow as unknown) === globalScope
  ) {
    return;
  }

  globalScope.addEventListener('error', (event) => {
    const PolyfillErrorEvent = globalScope.ErrorEvent;
    if (!isDefined(PolyfillErrorEvent)) {
      return;
    }

    try {
      polyfillWindow.dispatchEvent(
        new PolyfillErrorEvent('error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
        }),
      );
    } catch {}
  });

  globalScope.addEventListener('unhandledrejection', (event) => {
    const PolyfillPromiseRejectionEvent = globalScope.PromiseRejectionEvent;
    if (!isDefined(PolyfillPromiseRejectionEvent)) {
      return;
    }

    try {
      polyfillWindow.dispatchEvent(
        new PolyfillPromiseRejectionEvent('unhandledrejection', {
          reason: event.reason,
          promise: event.promise,
        }),
      );
    } catch {}
  });
};
