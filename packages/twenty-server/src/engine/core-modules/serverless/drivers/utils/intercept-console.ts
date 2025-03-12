/* eslint-disable no-console */

import { AsyncLocalStorage } from 'async_hooks';

export class ConsoleListener {
  private static isInitialized = false;
  private readonly originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };
  private readonly consoleAsyncLocalStrorage = new AsyncLocalStorage<{
    callback: (type: string, message: any[]) => void;
  }>();

  run<T>(
    callback: () => T,
    { onConsole }: { onConsole: (type: string, message: any[]) => void },
  ): T {
    if (!ConsoleListener.isInitialized) {
      this.intercept();

      ConsoleListener.isInitialized = true;
    }

    return this.consoleAsyncLocalStrorage.run<T>(
      {
        callback: onConsole,
      },
      callback,
    );
  }

  private intercept() {
    Object.keys(this.originalConsole).forEach((method) => {
      console[method] = (...args: any[]) => {
        const store = this.consoleAsyncLocalStrorage.getStore();
        const shouldIntercept = store !== undefined;

        if (shouldIntercept) {
          store.callback(method, args);
        } else {
          this.originalConsole[method](...args);
        }
      };
    });
  }
}
