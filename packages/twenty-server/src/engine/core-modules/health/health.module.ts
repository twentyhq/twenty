import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from 'src/engine/core-modules/health/controllers/health.controller';
import { MetricsController } from 'src/engine/core-modules/health/controllers/metrics.controller';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';

import { HealthCacheService } from './health-cache.service';

import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { WorkerHealthIndicator } from './indicators/worker.health';
@Module({
  imports: [TerminusModule, RedisClientModule],
  controllers: [HealthController, MetricsController],
  providers: [
    HealthCacheService,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    WorkerHealthIndicator,
  ],
  exports: [
    HealthCacheService,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    WorkerHealthIndicator,
  ],
})
export class HealthModule {}
