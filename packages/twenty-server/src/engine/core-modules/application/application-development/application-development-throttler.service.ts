import { Injectable } from '@nestjs/common';

import {
  APP_DEV_RATE_LIMIT_MAX,
  APP_DEV_RATE_LIMIT_WINDOW_MS,
} from 'src/engine/core-modules/application/application-development/constants/application-development.constants';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';

@Injectable()
export class ApplicationDevelopmentThrottlerService {
  constructor(private readonly throttlerService: ThrottlerService) {}

  async throttlePerApplication({
    applicationIdentifier,
    workspaceId,
  }: {
    applicationIdentifier: string;
    workspaceId: string;
  }): Promise<void> {
    await this.throttlerService.tokenBucketThrottleOrThrow(
      `app-dev:${workspaceId}:${applicationIdentifier}`,
      1,
      APP_DEV_RATE_LIMIT_MAX,
      APP_DEV_RATE_LIMIT_WINDOW_MS,
    );
  }
}
