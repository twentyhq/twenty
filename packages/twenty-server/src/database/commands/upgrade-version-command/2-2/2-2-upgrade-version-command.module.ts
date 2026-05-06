import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';

import { SetCalendarEventDescriptionDisplayedMaxRowsCommand } from 'src/database/commands/upgrade-version-command/2-2/2-2-workspace-command-1786000000000-set-calendar-event-description-displayed-max-rows.command';
import { MigrateToBillingV2Command } from 'src/database/commands/upgrade-version-command/2-2/2-2-workspace-command-1797000001000-migrate-to-billing-v2.command';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    ApplicationModule,
    BillingModule,
    FeatureFlagModule,
    TypeOrmModule.forFeature([BillingPriceEntity]),
    StripeModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
    WorkspaceMigrationModule,
    TypeOrmModule.forFeature([BillingPriceEntity]),
  ],
  providers: [
    MigrateToBillingV2Command,
    SetCalendarEventDescriptionDisplayedMaxRowsCommand,
  ],
})
export class V2_2_UpgradeVersionCommandModule {}
