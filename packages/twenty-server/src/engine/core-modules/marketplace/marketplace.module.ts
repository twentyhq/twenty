import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationSyncModule } from 'src/engine/core-modules/application/application-sync.module';
import { MarketplaceCatalogSyncCronCommand } from 'src/engine/core-modules/marketplace/crons/commands/marketplace-catalog-sync.cron.command';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/marketplace/crons/marketplace-catalog-sync.cron.job';
import { MarketplaceCatalogSyncService } from 'src/engine/core-modules/marketplace/services/marketplace-catalog-sync.service';
import { MarketplaceQueryService } from 'src/engine/core-modules/marketplace/services/marketplace-query.service';
import { MarketplaceResolver } from 'src/engine/core-modules/marketplace/resolvers/marketplace.resolver';
import { MarketplaceService } from 'src/engine/core-modules/marketplace/services/marketplace.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    ApplicationSyncModule,
    PermissionsModule,
    TwentyConfigModule,
  ],
  providers: [
    MarketplaceService,
    MarketplaceCatalogSyncService,
    MarketplaceQueryService,
    MarketplaceCatalogSyncCronJob,
    MarketplaceCatalogSyncCronCommand,
    MarketplaceResolver,
  ],
  exports: [
    MarketplaceCatalogSyncService,
    MarketplaceQueryService,
    MarketplaceCatalogSyncCronCommand,
  ],
})
export class MarketplaceModule {}
