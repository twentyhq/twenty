import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();

export const typeORMCoreModuleOptions: TypeOrmModuleOptions = {
  url: process.env.PG_DATABASE_URL,
  type: 'postgres',
  logging: ['error'],
  schema: 'core',
  entities: ['dist/src/engine/core-modules/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: '_typeorm_migrations',
  migrations: ['dist/src/database/typeorm/core/migrations/*{.ts,.js}'],
  ssl:
    process.env.PG_SSL_ALLOW_SELF_SIGNED === 'true'
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
};

export const connectionSource = new DataSource(
  typeORMCoreModuleOptions as DataSourceOptions,
);
