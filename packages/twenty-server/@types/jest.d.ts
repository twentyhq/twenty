import 'jest';

declare module '@jest/types' {
  namespace Config {
    interface ConfigGlobals {
      APP_PORT: number;
      ACCESS_TOKEN: string;
    }
  }
}

declare global {
  const APP_PORT: number;
  const ACCESS_TOKEN: string;
}

export {};
