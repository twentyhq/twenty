import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { HealthSystem } from 'src/engine/core-modules/health/types/health-system.types';

import { HealthCacheService } from './health-cache.service';

import { DatabaseHealthIndicator } from './indicators/database.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { WorkerHealthIndicator } from './indicators/worker.health';

@Controller('healthz')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseHealth: DatabaseHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
    private readonly workerHealth: WorkerHealthIndicator,
    private readonly healthCacheService: HealthCacheService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.databaseHealth.isHealthy('database'),
      () => this.redisHealth.isHealthy('redis'),
      () => this.workerHealth.isHealthy('worker'),
    ]);
  }

  @Get('/system-status')
  getSystemStatus(): Promise<HealthSystem> {
    return this.healthCacheService.getSystemStatus();
  }

  @Get('/message-channel-sync-job-by-status-counter')
  getMessageChannelSyncJobByStatusCounter() {
    return this.healthCacheService.getMessageChannelSyncJobByStatusCounter();
  }

  @Get('/invalid-captcha-counter')
  getInvalidCaptchaCounter() {
    return this.healthCacheService.getInvalidCaptchaCounter();
  }
}
