import { Controller, Get } from '@nestjs/common';

import { HealthCacheService } from 'src/engine/core-modules/health/health-cache.service';
import { HealthCounterCacheKeys } from 'src/engine/core-modules/health/types/health-counter-cache-keys.type';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly healthCacheService: HealthCacheService) {}

  @Get('/message-channel-sync-job-by-status-counter')
  getMessageChannelSyncJobByStatusCounter() {
    return this.healthCacheService.countChannelSyncJobByStatus(
      HealthCounterCacheKeys.MessageChannelSyncJobByStatus,
    );
  }

  @Get('/invalid-captcha-counter')
  getInvalidCaptchaCounter() {
    return this.healthCacheService.getInvalidCaptchaCounter();
  }

  @Get('/calendar-channel-sync-job-by-status-counter')
  getCalendarChannelSyncJobByStatusCounter() {
    return this.healthCacheService.countChannelSyncJobByStatus(
      HealthCounterCacheKeys.CalendarEventSyncJobByStatus,
    );
  }
}
