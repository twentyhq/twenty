import { Module } from '@nestjs/common';

import { MarketplaceService } from 'src/modules/marketplace/services/marketplace.service';

@Module({
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
