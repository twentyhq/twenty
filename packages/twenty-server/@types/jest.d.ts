import 'jest';
import { DataSource } from 'typeorm';

declare module '@jest/types' {
  namespace Config {
    interface ConfigGlobals {
      APP_PORT: number;
      APPLE_JANE_ADMIN_ACCESS_TOKEN: string;
      EXPIRED_ACCESS_TOKEN: string;
      INVALID_ACCESS_TOKEN: string;
      APPLE_JONY_MEMBER_ACCESS_TOKEN: string;
      APPLE_PHIL_GUEST_ACCESS_TOKEN: string;
      ACME_JONY_MEMBER_ACCESS_TOKEN: string;
      API_KEY_ACCESS_TOKEN: string;
      testDataSource?: DataSource;
    }
  }
}

declare global {
  const APP_PORT: number;
  const APPLE_JANE_ADMIN_ACCESS_TOKEN: string;
  const EXPIRED_ACCESS_TOKEN: string;
  const INVALID_ACCESS_TOKEN: string;
  const APPLE_JONY_MEMBER_ACCESS_TOKEN: string;
  const APPLE_PHIL_GUEST_ACCESS_TOKEN: string;
  const API_KEY_ACCESS_TOKEN: string;
  const ACME_JONY_MEMBER_ACCESS_TOKEN: string;
  const WORKSPACE_AGNOSTIC_TOKEN: string;
  const testDataSource: DataSource;
}

export {};
