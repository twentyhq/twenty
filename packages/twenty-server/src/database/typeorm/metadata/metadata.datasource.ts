import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();

export const typeORMMetadataModuleOptions: TypeOrmModuleOptions = {
  url: process.env.PG_DATABASE_URL,
  type: 'postgres',
  logging: ['error'],
  schema: 'metadata',
  entities: ['dist/src/engine/metadata-modules/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: '_typeorm_migrations',
  migrations: ['dist/src/database/typeorm/metadata/migrations/*{.ts,.js}'],
};
export const connectionSource = new DataSource(
  typeORMMetadataModuleOptions as DataSourceOptions,
);
