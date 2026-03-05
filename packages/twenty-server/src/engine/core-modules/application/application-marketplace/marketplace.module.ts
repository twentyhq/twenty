import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { MarketplaceCatalogSyncCronCommand } from 'src/engine/core-modules/application/application-marketplace/crons/commands/marketplace-catalog-sync.cron.command';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/application/application-marketplace/crons/marketplace-catalog-sync.cron.job';
import { MarketplaceCatalogSyncService } from 'src/engine/core-modules/application/application-marketplace/services/marketplace-catalog-sync.service';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/services/marketplace-query.service';
import { MarketplaceResolver } from 'src/engine/core-modules/application/application-marketplace/resolvers/marketplace.resolver';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/services/marketplace.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    ApplicationInstallModule,
    FeatureFlagModule,
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
