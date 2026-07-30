import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import {
  ThrottlerException,
  ThrottlerExceptionCode,
} from 'src/engine/core-modules/throttler/throttler.exception';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Limits how many jobs an application can enqueue so a single app cannot
// overwhelm the queues. Two tiers, mirroring the API rate limiting: a lower
// per-installation ceiling and a higher ceiling shared across every workspace
// that installed the same registration.
@Injectable()
export class JobEnqueueThrottlerGuard {
  constructor(
    private readonly throttlerService: ThrottlerService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly metricsService: MetricsService,
  ) {}

  async assertCanEnqueueOrThrow(tokensToConsume = 1): Promise<void> {
    // Jobs are also enqueued outside any request scope (crons, workers, system
    // tasks), where no auth context is set. Those enqueues are not application
    // attributed and are never throttled.
    const authContext = workspaceAuthContextStorage.getStore();

    if (!isDefined(authContext) || !isApplicationAuthContext(authContext)) {
      return;
    }

    const { application } = authContext;

    const timeWindow = this.twentyConfigService.get(
      'APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS',
    );
    const applicationKey = `enqueue:throttler:application:${application.id}`;
    const applicationLimit = this.twentyConfigService.get(
      'APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT',
    );
    const registrationKey = `enqueue:throttler:application-registration:${
      application.applicationRegistrationId ?? application.universalIdentifier
    }`;
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
          universal_identifier: application.universalIdentifier,
          app_name: application.name,
          source_type: application.sourceType,
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
