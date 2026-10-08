import { Module } from '@nestjs/common';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { MarketplaceCatalogSyncCronCommand } from 'src/engine/core-modules/application/application-marketplace/crons/commands/marketplace-catalog-sync.cron.command';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/application/application-marketplace/crons/marketplace-catalog-sync.cron.job';
import { MarketplaceCatalogCacheProviderService } from 'src/engine/core-modules/application/application-marketplace/marketplace-catalog-cache-provider.service';
import { MarketplaceCatalogSyncService } from 'src/engine/core-modules/application/application-marketplace/marketplace-catalog-sync.service';
import { MarketplacePublicResolver } from 'src/engine/core-modules/application/application-marketplace/marketplace-public.resolver';
import { MarketplaceQueryService } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.service';
import { MarketplaceQueryResolver } from 'src/engine/core-modules/application/application-marketplace/marketplace-query.resolver';
import { MarketplaceResolver } from 'src/engine/core-modules/application/application-marketplace/marketplace.resolver';
import { MarketplaceService } from 'src/engine/core-modules/application/application-marketplace/marketplace.service';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { MarketplaceCatalogSyncCommand } from 'src/engine/core-modules/application/application-marketplace/crons/commands/marketplace-catalog-sync.command';

@Module({
  imports: [
    ApplicationModule,
    ApplicationRegistrationLookupModule,
    ApplicationRegistrationModule,
    CoreEntityCacheModule,
    PermissionsModule,
  ],
  providers: [
    MarketplaceService,
    MarketplaceCatalogSyncService,
    MarketplaceQueryService,
    MarketplaceCatalogCacheProviderService,
    MarketplaceCatalogSyncCronJob,
    MarketplaceCatalogSyncCronCommand,
    MarketplaceCatalogSyncCommand,
    MarketplaceQueryResolver,
    MarketplaceResolver,
    MarketplacePublicResolver,
  ],
  exports: [MarketplaceQueryService, MarketplaceCatalogSyncCronCommand],
})
export class MarketplaceModule {}
