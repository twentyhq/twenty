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

  intercept(callback: (type: string, message: any[]) => void) {
    Object.keys(this.originalConsole).forEach((method) => {
      console[method] = (...args: any[]) => {
        callback(method, args);
      };
    });
  }

  release() {
    Object.keys(this.originalConsole).forEach((method) => {
      console[method] = (...args: any[]) => {
        this.originalConsole[method](...args);
      };
    });
  }
}
