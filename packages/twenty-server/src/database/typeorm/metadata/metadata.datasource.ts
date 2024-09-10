import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { join } from 'path';

import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
config();

export const typeORMMetadataModuleOptions: TypeOrmModuleOptions = {
  url: process.env.PG_DATABASE_URL,
  type: 'postgres',
  logging: ['error'],
  schema: 'metadata',
  entities: [
    join(
      __dirname,
      '../../../../src/engine/metadata-modules/**/*.entity{.ts,.js}',
    ),
  ],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: '_typeorm_migrations',
  migrations: [
    join(
      __dirname,
      '../../../../src/database/typeorm/metadata/migrations/*{.ts,.js}',
    ),
  ],
  ssl:
    process.env.PG_SSL_ALLOW_SELF_SIGNED === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
  extra: {
    query_timeout: 10000,
  },
};
export const connectionSource = new DataSource(
  typeORMMetadataModuleOptions as DataSourceOptions,
);
