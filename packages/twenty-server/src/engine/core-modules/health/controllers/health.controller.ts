import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { HealthServiceName } from 'src/engine/core-modules/health/enums/health-service-name.enum';
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
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([]);
  }

  @Get('/:serviceName')
  @HealthCheck()
  checkService(@Param('serviceName') serviceName: HealthServiceName) {
    const checks = {
      [HealthServiceName.DATABASE]: () => this.databaseHealth.isHealthy(),
      [HealthServiceName.REDIS]: () => this.redisHealth.isHealthy(),
      [HealthServiceName.WORKER]: () => this.workerHealth.isHealthy(),
    };

    if (!(serviceName in checks)) {
      throw new BadRequestException(`Invalid service name: ${serviceName}`);
    }

    return this.health.check([checks[serviceName]]);
  }
}
