import { type TypeOrmModuleOptions } from '@nestjs/typeorm';

import { config } from 'dotenv';
import { DataSource, type DataSourceOptions, type LogLevel } from 'typeorm';
config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const isRunningCommand = (): boolean => {
  const scriptPath = process.argv[1] || '';

  return scriptPath.includes('/command/command.');
};

const getLoggingConfig = (): LogLevel[] => {
  // ORM_QUERY_LOGGING can be: 'disabled', 'server-only', 'always'
  const ormQueryLogging = process.env.ORM_QUERY_LOGGING || 'disabled';

  if (ormQueryLogging === 'disabled') {
    return ['error'];
  }

  if (ormQueryLogging === 'server-only') {
    if (isRunningCommand()) {
      return ['error'];
    }

    return ['query', 'error'];
  }

  if (ormQueryLogging === 'always') {
    return ['query', 'error'];
  }

  if (process.env.NODE_ENV === 'test') {
    return [];
  }

  return ['error'];
};

const isJest = process.argv.some((arg) => arg.includes('jest'));

export const typeORMCoreModuleOptions: TypeOrmModuleOptions = {
  url: process.env.PG_DATABASE_URL,
  type: 'postgres',
  logging: getLoggingConfig(),
  schema: 'core',
  entities:
    process.env.IS_BILLING_ENABLED === 'true'
      ? [
          `${isJest ? '' : 'dist/'}src/engine/core-modules/**/*.entity{.ts,.js}`,
          `${isJest ? '' : 'dist/'}src/engine/metadata-modules/**/*.entity{.ts,.js}`,
        ]
      : [
          `${isJest ? '' : 'dist/'}src/engine/core-modules/**/!(billing-*).entity.{ts,js}`,
          `${isJest ? '' : 'dist/'}src/engine/metadata-modules/**/*.entity{.ts,.js}`,
        ],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: '_typeorm_migrations',
  metadataTableName: '_typeorm_generated_columns_and_materialized_views',
  migrations:
    process.env.IS_BILLING_ENABLED === 'true'
      ? [
          `${isJest ? '' : 'dist/'}src/database/typeorm/core/migrations/common/*{.ts,.js}`,
          `${isJest ? '' : 'dist/'}src/database/typeorm/core/migrations/billing/*{.ts,.js}`,
        ]
      : [
          `${isJest ? '' : 'dist/'}src/database/typeorm/core/migrations/common/*{.ts,.js}`,
        ],
  ssl:
    process.env.PG_SSL_ALLOW_SELF_SIGNED === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  extra: {
    query_timeout: 15000,
  },
};

export const connectionSource = new DataSource(
  typeORMCoreModuleOptions as DataSourceOptions,
);
