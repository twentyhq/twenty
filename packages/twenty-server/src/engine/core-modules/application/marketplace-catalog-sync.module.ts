import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { MarketplaceCatalogSyncCronCommand } from 'src/engine/core-modules/application/crons/commands/marketplace-catalog-sync.cron.command';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/application/crons/marketplace-catalog-sync.cron.job';
import { MarketplaceCatalogSyncService } from 'src/engine/core-modules/application/services/marketplace-catalog-sync.service';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    ApplicationModule,
  ],
  providers: [
    MarketplaceCatalogSyncService,
    MarketplaceCatalogSyncCronJob,
    MarketplaceCatalogSyncCronCommand,
  ],
  exports: [MarketplaceCatalogSyncService, MarketplaceCatalogSyncCronCommand],
})
export class MarketplaceCatalogSyncModule {}
