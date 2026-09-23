import { Injectable } from '@nestjs/common';

import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class ServerCronDispatchRateLimiterService {
  constructor(
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async computeDispatchDelaysMs({
    applicationRegistrationId,
    dispatchCount,
  }: {
    applicationRegistrationId: string;
    dispatchCount: number;
  }): Promise<number[]> {
    if (dispatchCount === 0) {
      return [];
    }

    const key = `server-cron-dispatch:throttler:application-registration:${applicationRegistrationId}`;
    const limit = this.twentyConfigService.get(
      'APPLICATION_REGISTRATION_SERVER_CRON_DISPATCH_RATE_LIMITING_LIMIT',
    );
    const timeWindow = this.twentyConfigService.get(
      'APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS',
    );

    const availableTokens = await this.throttlerService.getAvailableTokensCount(
      key,
      limit,
      timeWindow,
    );

    await this.throttlerService.consumeTokens(
      key,
      dispatchCount,
      limit,
      timeWindow,
    );

    const millisecondsPerToken = timeWindow / limit;

    return Array.from({ length: dispatchCount }, (_, dispatchIndex) => {
      const missingTokens = dispatchIndex + 1 - availableTokens;

      return missingTokens > 0
        ? Math.ceil(missingTokens * millisecondsPerToken)
        : 0;
    });
  }
}
