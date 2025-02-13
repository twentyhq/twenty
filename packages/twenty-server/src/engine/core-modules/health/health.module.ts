import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';

import { HealthCacheService } from './health-cache.service';
import { HealthController } from './health.controller';

import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { WorkerHealthIndicator } from './indicators/worker.health';

@Module({
  imports: [TerminusModule, RedisClientModule],
  controllers: [HealthController],
  providers: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    WorkerHealthIndicator,
    HealthCacheService,
  ],
  exports: [HealthCacheService],
})
export class HealthModule {}
