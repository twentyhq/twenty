import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';
import { HealthController } from 'src/engine/core-modules/health/health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthCacheService],
  exports: [HealthCacheService],
})
export class HealthModule {}
