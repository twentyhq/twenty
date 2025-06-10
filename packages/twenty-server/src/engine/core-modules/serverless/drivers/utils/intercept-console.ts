/* eslint-disable no-console */
export class ConsoleListener {
  private readonly originalConsole;

  constructor() {
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(callback: (type: string, message: any[]) => void) {
    Object.keys(this.originalConsole).forEach((method) => {
      // @ts-expect-error legacy noImplicitAny
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console[method] = (...args: any[]) => {
        callback(method, args);
      };
    });
  }

  release() {
    Object.keys(this.originalConsole).forEach((method) => {
      // @ts-expect-error legacy noImplicitAny
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console[method] = (...args: any[]) => {
        // @ts-expect-error legacy noImplicitAny
        this.originalConsole[method](...args);
      };
    });
  }
}
