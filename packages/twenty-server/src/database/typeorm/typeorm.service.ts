import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { User } from 'src/core/user/user.entity';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { RefreshToken } from 'src/core/refresh-token/refresh-token.entity';
import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { BillingSubscription } from 'src/core/billing/entities/billing-subscription.entity';
import { BillingSubscriptionItem } from 'src/core/billing/entities/billing-subscription-item.entity';

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
      entities: [
        User,
        Workspace,
        RefreshToken,
        FeatureFlagEntity,
        BillingSubscription,
        BillingSubscriptionItem,
      ],
    });
  }

  public getMainDataSource(): DataSource {
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
    const isMultiDatasourceEnabled = false;

    if (isMultiDatasourceEnabled) {
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

    return this.mainDataSource;
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

  public async fetchExistingTableIndexes(
    schemaName: string,
    tableName: string,
    queryRunner?: QueryRunner,
  ): Promise<
    {
      tableName: string;
      indexName: string;
      columnNames: string;
      isUnique: boolean;
      indexDefinition: string;
    }[]
  > {
    const query = `
      SELECT
      _table.relname as "tableName",
      _index.relname as "indexName",
      array_agg(_attribute.attname ORDER BY idx) as "columnNames",
      _table_index.indisunique as "isUnique",
      pg_get_indexdef(_table_index.indexrelid) as "indexDefinition"
    FROM
      pg_class _table
    JOIN
      pg_index _table_index ON _table.oid = _table_index.indrelid
    JOIN
      pg_class _index ON _index.oid = _table_index.indexrelid
    JOIN
      pg_namespace _namespace ON _table.relnamespace = _namespace.oid
    JOIN
      LATERAL unnest(_table_index.indkey) WITH ORDINALITY as col(att, idx) ON true
    JOIN
      pg_attribute _attribute ON _attribute.attrelid = _table.oid AND _attribute.attnum = col.att
    WHERE
      _table.relkind = 'r'
      AND _table.relname = $1
      AND _namespace.nspname = $2
      AND _table_index.indisprimary = FALSE
    GROUP BY
      _table.relname,
      _index.relname,
      _table_index.indisunique,
      _table_index.indexrelid
    ORDER BY
      _table.relname,
      _index.relname;
    `;

    if (!queryRunner) {
      const queryRunner = this.mainDataSource.createQueryRunner();

      const existingIndexes = queryRunner.query(query, [tableName, schemaName]);

      await queryRunner.release();

      return existingIndexes;
    }

    const existingIndexes = await queryRunner.query(query, [
      tableName,
      schemaName,
    ]);

    return existingIndexes;
  }
}
