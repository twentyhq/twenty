/* oxlint-disable no-console */
type ConsoleMethod = 'log' | 'error' | 'warn' | 'info' | 'debug';

const CONSOLE_METHODS: ConsoleMethod[] = [
  'log',
  'error',
  'warn',
  'info',
  'debug',
];

export class ConsoleListener {
  private readonly originalConsole: Record<
    ConsoleMethod,
    (...args: unknown[]) => void
  >;

  constructor() {
    this.originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };
  }

  // oxlint-disable-next-line typescript/no-explicit-any
  intercept(callback: (type: string, message: any[]) => void) {
    CONSOLE_METHODS.forEach((method) => {
      console[method] = (...args: unknown[]) => {
        callback(method, args);
      };
    });
  }

  release() {
    CONSOLE_METHODS.forEach((method) => {
      console[method] = (...args: unknown[]) => {
        this.originalConsole[method](...args);
      };
    });
  }
}
