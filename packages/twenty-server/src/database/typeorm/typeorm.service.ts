import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingMeter } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { PostgresCredentials } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
@Injectable()
export class TypeORMService implements OnModuleInit, OnModuleDestroy {
  private mainDataSource: DataSource;
  private dataSources: Map<string, DataSource> = new Map();
  private isDatasourceInitializing: Map<string, boolean> = new Map();

  constructor(private readonly environmentService: EnvironmentService) {
    this.mainDataSource = new DataSource({
      url: environmentService.get('PG_DATABASE_URL'),
      type: 'postgres',
      logging: false,
      schema: 'core',
      entities: [
        User,
        Workspace,
        UserWorkspace,
        AppToken,
        KeyValuePair,
        FeatureFlagEntity,
        BillingSubscription,
        BillingSubscriptionItem,
        BillingMeter,
        BillingCustomer,
        BillingProduct,
        BillingPrice,
        BillingEntitlement,
        PostgresCredentials,
        WorkspaceSSOIdentityProvider,
      ],
      metadataTableName: '_typeorm_generated_columns_and_materialized_views',
      ssl: environmentService.get('PG_SSL_ALLOW_SELF_SIGNED')
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
      url: dataSource.url ?? this.environmentService.get('PG_DATABASE_URL'),
      type: 'postgres',
      logging: this.environmentService.get('DEBUG_MODE')
        ? ['query', 'error']
        : ['error'],
      schema,
      ssl: this.environmentService.get('PG_SSL_ALLOW_SELF_SIGNED')
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
    });

    await workspaceDataSource.initialize();

    return workspaceDataSource;
  }

  public async disconnectFromDataSource(dataSourceId: string) {
    if (!this.dataSources.has(dataSourceId)) {
      return;
    }

    const dataSource = this.dataSources.get(dataSourceId);

    await dataSource?.destroy();

    this.dataSources.delete(dataSourceId);
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
    await this.mainDataSource.destroy();

    // Destroy all workspace data sources
    for (const [, dataSource] of this.dataSources) {
      await dataSource.destroy();
    }
  }
}
