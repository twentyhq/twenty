import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

import { DataSource } from 'typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { ApprovedAccessDomain } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { BillingCustomer } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { BillingEntitlement } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { BillingMeter } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { BillingPrice } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingSubscriptionItem } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { PostgresCredentials } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorMethod } from 'src/engine/core-modules/two-factor-method/two-factor-method.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';

@Injectable()
export class TypeORMService implements OnModuleInit, OnModuleDestroy {
  private mainDataSource: DataSource;

  constructor(private readonly twentyConfigService: TwentyConfigService) {
    this.mainDataSource = new DataSource({
      url: twentyConfigService.get('PG_DATABASE_URL'),
      type: 'postgres',
      logging: twentyConfigService.getLoggingConfig(),
      schema: 'core',
      entities: [
        User,
        Workspace,
        UserWorkspace,
        AppToken,
        KeyValuePair,
        FeatureFlag,
        BillingSubscription,
        BillingSubscriptionItem,
        BillingMeter,
        BillingCustomer,
        BillingProduct,
        BillingPrice,
        BillingEntitlement,
        PostgresCredentials,
        WorkspaceSSOIdentityProvider,
        ApprovedAccessDomain,
        TwoFactorMethod,
        AgentEntity,
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
    await this.mainDataSource.destroy();
  }
}
