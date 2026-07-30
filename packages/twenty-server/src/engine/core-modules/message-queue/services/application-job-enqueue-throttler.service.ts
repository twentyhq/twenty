import { Injectable } from '@nestjs/common';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Limits how many jobs an application can enqueue so a single app cannot flood a
// queue. Two tiers mirror the API rate limiting: a lower per-installation ceiling
// and a higher ceiling shared across every workspace that installed the same
// registration. Both buckets are checked before either is debited, so a rejection
// on one tier never burns quota on the other.
@Injectable()
export class ApplicationJobEnqueueThrottlerService {
  constructor(
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  async throttleOrThrow({
    applicationId,
    applicationRegistrationId,
    jobCount = 1,
  }: {
    applicationId: string;
    applicationRegistrationId: string;
    jobCount?: number;
  }): Promise<void> {
    const timeWindow = this.twentyConfigService.get(
      'APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS',
    );
    const applicationKey = `enqueue:throttler:application:${applicationId}`;
    const applicationLimit = this.twentyConfigService.get(
      'APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT',
    );
    const registrationKey = `enqueue:throttler:application-registration:${applicationRegistrationId}`;
    const registrationLimit = this.twentyConfigService.get(
      'APPLICATION_REGISTRATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT',
    );

    const [applicationTokens, registrationTokens] = await Promise.all([
      this.throttlerService.getAvailableTokensCount(
        applicationKey,
        applicationLimit,
        timeWindow,
      ),
      this.throttlerService.getAvailableTokensCount(
        registrationKey,
        registrationLimit,
        timeWindow,
      ),
    ]);

    if (applicationTokens < jobCount || registrationTokens < jobCount) {
      await this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobEnqueueApplicationRateLimited,
        shouldStoreInCache: false,
        attributes: {
          application_id: applicationId,
          application_registration_id: applicationRegistrationId,
        },
      });

      throw new ThrottlerException(
        'Application job enqueue limit reached',
        ThrottlerExceptionCode.LIMIT_REACHED,
      );
    }

    await Promise.all([
      this.throttlerService.consumeTokens(
        applicationKey,
        jobCount,
        applicationLimit,
        timeWindow,
      ),
      this.throttlerService.consumeTokens(
        registrationKey,
        jobCount,
        registrationLimit,
        timeWindow,
      ),
    ]);
  }
}
