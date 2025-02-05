import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';

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
}
