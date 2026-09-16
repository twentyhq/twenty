import { Injectable } from '@nestjs/common';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Ceiling on how far a deferred enqueue is pushed out. A burst larger than this
// is worth seeing in the logs rather than silently scheduling jobs hours away.
const MAX_ENQUEUE_DEFERRAL_MS = 60 * 60 * 1_000;

const computeRefillDelayMs = ({
  missingTokens,
  limit,
  timeWindow,
}: {
  missingTokens: number;
  limit: number;
  timeWindow: number;
}): number =>
  missingTokens > 0 ? Math.ceil(missingTokens / (limit / timeWindow)) : 0;

@Injectable()
export class ApplicationJobEnqueueThrottlerService {
  constructor(
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  private getBucketConfiguration({
    applicationId,
    applicationRegistrationId,
  }: {
    applicationId: string;
    applicationRegistrationId: string;
  }) {
    return {
      timeWindow: this.twentyConfigService.get(
        'APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS',
      ),
      applicationKey: `enqueue:throttler:application:${applicationId}`,
      applicationLimit: this.twentyConfigService.get(
        'APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT',
      ),
      registrationKey: `enqueue:throttler:application-registration:${applicationRegistrationId}`,
      registrationLimit: this.twentyConfigService.get(
        'APPLICATION_REGISTRATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT',
      ),
    };
  }

  private incrementRateLimitedMetric({
    applicationId,
    applicationRegistrationId,
  }: {
    applicationId: string;
    applicationRegistrationId: string;
  }) {
    return this.metricsService.incrementCounterForEvent({
      key: MetricsKeys.JobEnqueueApplicationRateLimited,
      shouldStoreInCache: false,
      attributes: {
        application_id: applicationId,
        application_registration_id: applicationRegistrationId,
      },
    });
  }

  async throttleOrThrow({
    applicationId,
    applicationRegistrationId,
    jobCount = 1,
  }: {
    applicationId: string;
    applicationRegistrationId: string;
    jobCount?: number;
  }): Promise<void> {
    const {
      timeWindow,
      applicationKey,
      applicationLimit,
      registrationKey,
      registrationLimit,
    } = this.getBucketConfiguration({
      applicationId,
      applicationRegistrationId,
    });

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
      await this.incrementRateLimitedMetric({
        applicationId,
        applicationRegistrationId,
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

  // Refusing an enqueue drops the jobs for good, which is only acceptable when
  // the caller fires again on its own. For one-shot work, the budget is spent
  // as a delay instead: tokens are always consumed, so a bucket already in
  // debt pushes the next caller further out and the burst spreads rather than
  // disappearing.
  async reserveEnqueueDelay({
    applicationId,
    applicationRegistrationId,
    jobCount = 1,
  }: {
    applicationId: string;
    applicationRegistrationId: string;
    jobCount?: number;
  }): Promise<{ delayMs: number; isCapped: boolean }> {
    const {
      timeWindow,
      applicationKey,
      applicationLimit,
      registrationKey,
      registrationLimit,
    } = this.getBucketConfiguration({
      applicationId,
      applicationRegistrationId,
    });

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

    const requiredDelayMs = Math.max(
      computeRefillDelayMs({
        missingTokens: jobCount - applicationTokens,
        limit: applicationLimit,
        timeWindow,
      }),
      computeRefillDelayMs({
        missingTokens: jobCount - registrationTokens,
        limit: registrationLimit,
        timeWindow,
      }),
    );

    if (requiredDelayMs > 0) {
      await this.incrementRateLimitedMetric({
        applicationId,
        applicationRegistrationId,
      });
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

    return {
      delayMs: Math.min(requiredDelayMs, MAX_ENQUEUE_DEFERRAL_MS),
      isCapped: requiredDelayMs > MAX_ENQUEUE_DEFERRAL_MS,
    };
  }
}
