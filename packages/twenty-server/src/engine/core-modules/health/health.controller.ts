import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { HealthCacheService } from './health-cache.service';

@Controller('healthz')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private healthCacheService: HealthCacheService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([]);
  }

  @Get('/message-channel-sync-job-by-status-counter')
  getMessageChannelSyncJobByStatusCounter() {
    return this.healthCacheService.getMessageChannelSyncJobByStatusCounter();
  }

  @Get('/invalid-captcha-counter')
  getInvalidCaptchaCounter() {
    return this.healthCacheService.getInvalidCaptchaCounter();
  }

  @Get('/system-status')
  getSystemStatus() {
    return this.healthCacheService.getSystemStatus();
  }
}
