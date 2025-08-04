import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class TypeORMService implements OnModuleInit, OnModuleDestroy {
  private mainDataSource: DataSource;
  private readonly logger = new Logger(TypeORMService.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {
    const isJest = process.argv.some((arg) => arg.includes('jest'));

    this.mainDataSource = new DataSource({
      url: twentyConfigService.get('PG_DATABASE_URL'),
      type: 'postgres',
      logging: twentyConfigService.getLoggingConfig(),
      schema: 'core',
      entities: [
        `${isJest ? '' : 'dist/'}src/engine/core-modules/**/*.entity{.ts,.js}`,
        `${isJest ? '' : 'dist/'}src/engine/metadata-modules/**/*.entity{.ts,.js}`,
      ],
      metadataTableName: '_typeorm_generated_columns_and_materialized_views',
      ssl: twentyConfigService.get('PG_SSL_ALLOW_SELF_SIGNED')
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
      extra: {
        query_timeout: 10000,
      },
    });
  }

  public getMainDataSource(): DataSource {
    return this.mainDataSource;
  }

  public async createSchema(schemaName: string): Promise<string> {
    const queryRunner = this.mainDataSource.createQueryRunner();

    await queryRunner.createSchema(schemaName, true);

    await queryRunner.release();

    return schemaName;
  }

  public async deleteSchema(schemaName: string) {
    const queryRunner = this.mainDataSource.createQueryRunner();

    await queryRunner.dropSchema(schemaName, true, true);

    await queryRunner.release();
  }

  async onModuleInit() {
    // Init main data source "default" schema
    await this.mainDataSource.initialize();
  }

  async onModuleDestroy() {
    // Destroy main data source "default" schema
    this.logger.log('Destroying main data source');
    await this.mainDataSource.destroy();
  }
}
