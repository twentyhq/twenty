import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();
const configService = new ConfigService();

export const typeORMCoreModuleOptions: TypeOrmModuleOptions = {
  url: configService.get<string>('PG_DATABASE_URL'),
  type: 'postgres',
  logging: ['error'],
  schema: 'core',
  entities: ['dist/src/core/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: '_typeorm_migrations',
  migrations: ['dist/src/database/typeorm/core/migrations/*{.ts,.js}'],
};
export const connectionSource = new DataSource(
  typeORMCoreModuleOptions as DataSourceOptions,
);
