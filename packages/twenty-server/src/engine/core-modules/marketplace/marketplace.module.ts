import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

import { MarketplaceResolver } from './marketplace.resolver';
import { MarketplaceService } from './marketplace.service';

@Module({
  imports: [PermissionsModule],
  providers: [MarketplaceResolver, MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
