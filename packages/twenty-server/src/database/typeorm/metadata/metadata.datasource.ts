import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config();
const configService = new ConfigService();

export const typeORMMetadataModuleOptions: TypeOrmModuleOptions = {
  url: configService.get<string>('PG_DATABASE_URL'),
  type: 'postgres',
  logging: ['error'],
  schema: 'metadata',
  entities: ['dist/src/metadata/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: '_typeorm_migrations',
  migrations: ['dist/src/database/typeorm/metadata/migrations/*{.ts,.js}'],
};
export const connectionSource = new DataSource(
  typeORMMetadataModuleOptions as DataSourceOptions,
);
