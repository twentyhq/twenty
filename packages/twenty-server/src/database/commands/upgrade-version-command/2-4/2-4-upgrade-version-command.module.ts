import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { MigrateToBillingV2Command } from 'src/database/commands/upgrade-version-command/2-4/2-4-workspace-command-1797000001000-migrate-to-billing-v2.command';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

@Module({
  imports: [
    BillingModule,
    FeatureFlagModule,
    StripeModule,
    TypeOrmModule.forFeature([BillingPriceEntity]),
    WorkspaceIteratorModule,
  ],
  providers: [MigrateToBillingV2Command],
})
export class V2_4_UpgradeVersionCommandModule {}
