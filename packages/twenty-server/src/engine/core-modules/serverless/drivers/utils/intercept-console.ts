/* eslint-disable no-console */

import { AsyncLocalStorage } from 'async_hooks';

const ASYNC_LOCAL_STORAGE_ACTIVATED = Symbol('AsyncLocalStorageActivated');

export class ConsoleListener {
  private readonly originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };
  private readonly consoleAsyncLocalStrorage = new AsyncLocalStorage<symbol>();
  private callback: (type: string, message: any[]) => void | undefined;

  onConsole(callback: (type: string, message: any[]) => void) {
    this.callback = callback;
  }

  run<T>(callback: () => T): T {
    return this.consoleAsyncLocalStrorage.run<T>(
      ASYNC_LOCAL_STORAGE_ACTIVATED,
      () => {
        this.intercept();

        return callback();
      },
    );
  }

  private intercept() {
    Object.keys(this.originalConsole).forEach((method) => {
      console[method] = (...args: any[]) => {
        const shouldIntercept =
          this.consoleAsyncLocalStrorage.getStore() ===
          ASYNC_LOCAL_STORAGE_ACTIVATED;

        if (shouldIntercept && this.callback !== undefined) {
          this.callback(method, args);
        } else {
          this.originalConsole[method](...args);
        }
      };
    });
  }

  release() {
    Object.keys(this.originalConsole).forEach((method) => {
      console[method] = this.originalConsole[method];
    });
  }
}
