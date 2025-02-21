import { Controller, Get } from '@nestjs/common';

import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';

@Controller('metricsz')
export class MetricsController {
  constructor(private readonly healthCacheService: HealthCacheService) {}

  @Get('/message-channel-sync-job-by-status-counter')
  getMessageChannelSyncJobByStatusCounter() {
    return this.healthCacheService.getMessageChannelSyncJobByStatusCounter();
  }

  @Get('/invalid-captcha-counter')
  getInvalidCaptchaCounter() {
    return this.healthCacheService.getInvalidCaptchaCounter();
  }

  @Get('/calendar-channel-sync-job-by-status-counter')
  getCalendarChannelSyncJobByStatusCounter() {
    return this.healthCacheService.getCalendarChannelSyncJobByStatusCounter();
  }
}
