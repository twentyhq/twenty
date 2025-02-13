import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';
import { HealthController } from 'src/engine/core-modules/health/health.controller';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';

@Module({
  imports: [TerminusModule, RedisClientModule],
  controllers: [HealthController],
  providers: [HealthCacheService],
  exports: [HealthCacheService],
})
export class HealthModule {}
