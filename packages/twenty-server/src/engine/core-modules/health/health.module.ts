import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AILayerModule } from 'src/engine/core-modules/ai-layer';
import { HealthController } from 'src/engine/core-modules/health/controllers/health.controller';
import { AppHealthIndicator } from 'src/engine/core-modules/health/indicators/app.health';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

import { AILayerHealthIndicator } from './indicators/ai-layer.health';
import { ConnectedAccountHealth } from './indicators/connected-account.health';
import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { WorkerHealthIndicator } from './indicators/worker.health';

@Module({
  imports: [
    TerminusModule,
    RedisClientModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
    MetricsModule,
    AILayerModule,
  ],
  controllers: [HealthController],
  providers: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    WorkerHealthIndicator,
    ConnectedAccountHealth,
    AppHealthIndicator,
    AILayerHealthIndicator,
  ],
  exports: [
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    WorkerHealthIndicator,
    ConnectedAccountHealth,
    AppHealthIndicator,
    AILayerHealthIndicator,
  ],
})
export class HealthModule {}
