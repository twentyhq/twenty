import { Module } from '@nestjs/common';

import { ApplicationBillingPriceService } from 'src/engine/core-modules/application/application-billing-price/application-billing-price.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [ApplicationBillingPriceService],
  exports: [ApplicationBillingPriceService],
})
export class ApplicationBillingPriceModule {}
