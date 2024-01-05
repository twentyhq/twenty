import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { User } from 'src/core/user/user.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { RefreshToken } from 'src/core/refresh-token/refresh-token.entity';
import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';

@Injectable()
export class TypeORMService implements OnModuleInit, OnModuleDestroy {
  private mainDataSource: DataSource;
  private dataSources: Map<string, DataSource> = new Map();
  private isDatasourceInitializing: Map<string, boolean> = new Map();

  constructor(private readonly environmentService: EnvironmentService) {
    this.mainDataSource = new DataSource({
      url: environmentService.getPGDatabaseUrl(),
      type: 'postgres',
      logging: false,
      schema: 'core',
      entities: [User, Workspace, RefreshToken, FeatureFlagEntity],
    });
  }

  public async getMainDataSource(): Promise<DataSource> {
    return this.mainDataSource;
  }

  /**
   * Connects to a data source using metadata. Returns a cached connection if it exists.
   * @param dataSource DataSourceEntity
   * @returns Promise<DataSource | undefined>
   */
  public async connectToDataSource(
    dataSource: DataSourceEntity,
  ): Promise<DataSource | undefined> {
    // Wait for a bit before trying again if another initialization is in progress
    while (this.isDatasourceInitializing.get(dataSource.id)) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    if (this.dataSources.has(dataSource.id)) {
      return this.dataSources.get(dataSource.id);
    }

    this.isDatasourceInitializing.set(dataSource.id, true);

    try {
      const dataSourceInstance =
        await this.createAndInitializeDataSource(dataSource);

      this.dataSources.set(dataSource.id, dataSourceInstance);

      return dataSourceInstance;
    } finally {
      this.isDatasourceInitializing.delete(dataSource.id);
    }
  }

  private async createAndInitializeDataSource(
    dataSource: DataSourceEntity,
  ): Promise<DataSource> {
    const schema = dataSource.schema;

    const workspaceDataSource = new DataSource({
      url: dataSource.url ?? this.environmentService.getPGDatabaseUrl(),
      type: 'postgres',
      logging: this.environmentService.isDebugMode()
        ? ['query', 'error']
        : ['error'],
      schema,
    });

    await workspaceDataSource.initialize();

    return workspaceDataSource;
  }

  /**
   * Disconnects from a workspace data source.
   * @param dataSourceId
   * @returns Promise<void>
   *
   */
  public async disconnectFromDataSource(dataSourceId: string) {
    if (!this.dataSources.has(dataSourceId)) {
      return;
    }

    const dataSource = this.dataSources.get(dataSourceId);

    await dataSource?.destroy();

    this.dataSources.delete(dataSourceId);
  }

  /**
   * Creates a new schema
   * @param workspaceId
   * @returns Promise<void>
   */
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
    await this.mainDataSource.destroy();

    // Destroy all workspace data sources
    for (const [, dataSource] of this.dataSources) {
      await dataSource.destroy();
    }
  }
}
