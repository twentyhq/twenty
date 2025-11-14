import { type TypeOrmModuleOptions } from '@nestjs/typeorm';

import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { DataSource, type DataSourceOptions, type LogLevel } from 'typeorm';

const ENV_FILENAME = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const SEARCH_ROOTS = Array.from(
  new Set(
    [process.cwd(), __dirname, process.env.INIT_CWD].filter(
      (value): value is string => !!value,
    ),
  ),
);

const findEnvFile = (): string | undefined => {
  for (const root of SEARCH_ROOTS) {
    let currentDir = root;
    const { root: fsRoot } = parse(currentDir);

    while (true) {
      const candidate = join(currentDir, ENV_FILENAME);
      if (existsSync(candidate)) {
        return candidate;
      }

      if (currentDir === fsRoot) {
        break;
      }

      currentDir = dirname(currentDir);
    }
  }

  return undefined;
};

let resolvedEnvPath: string | undefined;

if (!process.env.PG_DATABASE_URL) {
  resolvedEnvPath = findEnvFile();

  if (resolvedEnvPath) {
    config({
      path: resolvedEnvPath,
      override: false,
    });
  }
}

if (!process.env.PG_DATABASE_URL) {
  throw new Error(
    `PG_DATABASE_URL is not defined. Looked for ${ENV_FILENAME}${
      resolvedEnvPath ? ` (last attempted path: ${resolvedEnvPath})` : ''
    } starting from: ${SEARCH_ROOTS.join(', ')}`,
  );
}

const isRunningCommand = (): boolean => {
  const scriptPath = process.argv[1] || '';

  return scriptPath.includes('/command/command.');
};

const getLoggingConfig = (): LogLevel[] => {
  if (process.env.NODE_ENV === 'test') {
    return [];
  }
  const ormQueryLogging = process.env.ORM_QUERY_LOGGING || 'disabled';

  switch (ormQueryLogging) {
    case 'disabled':
      return ['error'];
    case 'server-only':
      if (isRunningCommand()) {
        return ['error'];
      }

      return ['query', 'error'];
    case 'always':
      return ['query', 'error'];
    default:
      return ['error'];
  }
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
