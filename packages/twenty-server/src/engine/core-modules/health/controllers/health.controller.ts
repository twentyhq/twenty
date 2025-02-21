import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';
import { ConnectedAccountHealth } from 'src/engine/core-modules/health/indicators/connected-account.health';
import { DatabaseHealthIndicator } from 'src/engine/core-modules/health/indicators/database.health';
import { RedisHealthIndicator } from 'src/engine/core-modules/health/indicators/redis.health';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';

@Controller('healthz')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly workerHealth: WorkerHealthIndicator,
    private readonly connectedAccountHealth: ConnectedAccountHealth,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([]);
  }

  @Get('/:indicatorId')
  @HealthCheck()
  checkService(@Param('indicatorId') indicatorId: HealthIndicatorId) {
    const checks = {
      [HealthIndicatorId.database]: () => this.databaseHealth.isHealthy(),
      [HealthIndicatorId.redis]: () => this.redisHealth.isHealthy(),
      [HealthIndicatorId.worker]: () => this.workerHealth.isHealthy(),
      [HealthIndicatorId.connectedAccount]: () =>
        this.connectedAccountHealth.isHealthy(),
    };

    if (!(indicatorId in checks)) {
      throw new BadRequestException(`Invalid indicatorId: ${indicatorId}`);
    }

    return this.health.check([checks[indicatorId]]);
  }
}
