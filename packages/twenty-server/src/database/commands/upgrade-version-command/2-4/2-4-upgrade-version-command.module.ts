import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { DropCompanyDomainNameMaxValuesCapCommand } from 'src/database/commands/upgrade-version-command/2-4/2-4-workspace-command-1797900000000-drop-company-domain-name-max-values-cap.command';
import { MigrateToBillingV2Command } from 'src/database/commands/upgrade-version-command/2-4/2-4-workspace-command-1797000001000-migrate-to-billing-v2.command';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    BillingModule,
    FeatureFlagModule,
    StripeModule,
    TypeOrmModule.forFeature([
      BillingPriceEntity,
      FieldMetadataEntity,
      ObjectMetadataEntity,
    ]),
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
  ],
  providers: [MigrateToBillingV2Command, DropCompanyDomainNameMaxValuesCapCommand],
})
export class V2_4_UpgradeVersionCommandModule {}
