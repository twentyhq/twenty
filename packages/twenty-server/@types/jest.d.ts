import { type INestApplication } from '@nestjs/common';

import 'jest';
import { type DataSource } from 'typeorm';

import { type DataSeedWorkspaceCommand } from 'src/database/commands/data-seed-dev-workspace.command';
import { type DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';

declare module '@jest/types' {
  namespace Config {
    interface ConfigGlobals {
      APP_PORT: number;
      APPLE_JANE_ADMIN_ACCESS_TOKEN: string;
      EXPIRED_ACCESS_TOKEN: string;
      INVALID_ACCESS_TOKEN: string;
      APPLE_JONY_MEMBER_ACCESS_TOKEN: string;
      APPLE_PHIL_GUEST_ACCESS_TOKEN: string;
      APPLE_SARAH_IMPERSONATE_TIM_INVALID_ACCESS_TOKEN: string;
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
  const APPLE_SARAH_IMPERSONATE_TIM_INVALID_ACCESS_TOKEN: string;

  // Additional global properties set during test setup
  var testDataSource: DataSource;
  var app: INestApplication;
  var dataSourceService: DataSourceService;
  var dataSeedWorkspaceCommand: DataSeedWorkspaceCommand;
}

export {};
