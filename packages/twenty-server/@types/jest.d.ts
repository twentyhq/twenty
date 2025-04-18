import 'jest';

declare module '@jest/types' {
  namespace Config {
    interface ConfigGlobals {
      APP_PORT: number;
      ADMIN_ACCESS_TOKEN: string;
      EXPIRED_ACCESS_TOKEN: string;
      INVALID_ACCESS_TOKEN: string;
      MEMBER_ACCESS_TOKEN: string;
      GUEST_ACCESS_TOKEN: string;
    }
  }
}

declare global {
  const APP_PORT: number;
  const ADMIN_ACCESS_TOKEN: string;
  const EXPIRED_ACCESS_TOKEN: string;
  const INVALID_ACCESS_TOKEN: string;
  const MEMBER_ACCESS_TOKEN: string;
  const GUEST_ACCESS_TOKEN: string;
}

export {};
