import { Module } from '@nestjs/common';

import { ApplicationHealthCacheService } from 'src/engine/core-modules/application/application-health/application-health-cache.service';

@Module({
  providers: [ApplicationHealthCacheService],
  exports: [ApplicationHealthCacheService],
})
export class ApplicationHealthCacheModule {}
