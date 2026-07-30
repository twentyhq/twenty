import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { getWorkspaceAuthContextOrUndefined } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
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
    const authContext = getWorkspaceAuthContextOrUndefined();

    if (!isDefined(authContext) || !isApplicationAuthContext(authContext)) {
      return;
    }

    const { application } = authContext;

    const timeWindow = this.twentyConfigService.get(
      'APPLICATION_JOB_ENQUEUE_RATE_LIMITING_TTL_IN_MS',
    );
    const registrationKey =
      application.applicationRegistrationId ?? application.universalIdentifier;

    try {
      await this.throttlerService.tokenBucketThrottleOrThrow(
        `enqueue:throttler:application:${application.id}`,
        tokensToConsume,
        this.twentyConfigService.get(
          'APPLICATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT',
        ),
        timeWindow,
      );

      await this.throttlerService.tokenBucketThrottleOrThrow(
        `enqueue:throttler:application-registration:${registrationKey}`,
        tokensToConsume,
        this.twentyConfigService.get(
          'APPLICATION_REGISTRATION_JOB_ENQUEUE_RATE_LIMITING_LIMIT',
        ),
        timeWindow,
      );
    } catch (error) {
      if (
        error instanceof ThrottlerException &&
        error.code === ThrottlerExceptionCode.LIMIT_REACHED
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
      }

      throw error;
    }
  }
}
