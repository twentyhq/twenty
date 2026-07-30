import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { GUARDED_ENQUEUE_QUEUES } from 'src/engine/core-modules/message-queue/constants/guarded-enqueue-queues.constant';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { applicationJobEnqueueContextStorage } from 'src/engine/core-modules/message-queue/storage/application-job-enqueue-context.storage';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Limits how many jobs an application can enqueue to guarded queues so a single
// app cannot overwhelm them. Two tiers, mirroring the API rate limiting: a lower
// per-installation ceiling and a higher ceiling shared across every workspace
// that installed the same registration. Enqueues to guarded queues must run
// within an application enqueue context, otherwise they are rejected.
@Injectable()
export class JobEnqueueThrottlerGuard {
  constructor(
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  async assertCanEnqueueOrThrow(
    queueName: MessageQueue,
    tokensToConsume = 1,
  ): Promise<void> {
    if (!GUARDED_ENQUEUE_QUEUES.has(queueName)) {
      return;
    }

    const context = applicationJobEnqueueContextStorage.getStore();

    if (
      !isDefined(context?.applicationId) ||
      !isDefined(context?.applicationRegistrationId)
    ) {
      throw new Error(
        `Cannot enqueue to ${queueName} without an application enqueue context. Wrap the enqueue with withApplicationJobEnqueueContext.`,
      );
    }

    const { applicationId, applicationRegistrationId } = context;

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

    // Check both buckets before debiting either, so a rejection on one tier
    // never burns quota on the other.
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

    if (
      applicationTokens < tokensToConsume ||
      registrationTokens < tokensToConsume
    ) {
      await this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.JobEnqueueApplicationRateLimited,
        shouldStoreInCache: false,
        attributes: {
          queue: queueName,
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
        tokensToConsume,
        applicationLimit,
        timeWindow,
      ),
      this.throttlerService.consumeTokens(
        registrationKey,
        tokensToConsume,
        registrationLimit,
        timeWindow,
      ),
    ]);
  }
}
