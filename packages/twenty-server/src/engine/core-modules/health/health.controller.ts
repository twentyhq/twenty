import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';

import { HealthCacheService } from './health-cache.service';

@Controller('healthz')
export class HealthController {
  constructor(
    private redisClient: RedisClientService,
    private healthCacheService: HealthCacheService,
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
  ) {}

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
