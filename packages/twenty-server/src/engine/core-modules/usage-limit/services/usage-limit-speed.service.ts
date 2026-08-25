import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TRY_CONSUME_TOKEN_BUCKETS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/try-consume-token-buckets-script.constant';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type SpeedBucketOutcome } from 'src/engine/core-modules/usage-limit/types/speed-bucket-outcome.type';
import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';
import { buildSpeedBuckets } from 'src/engine/core-modules/usage-limit/utils/build-speed-buckets.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const ADMITTED: SpeedBucketOutcome = { admitted: true, remainingByBucket: [] };

@Injectable()
export class UsageLimitSpeedService {
  private readonly logger = new Logger(UsageLimitSpeedService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineUsageLimit)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async consumeOrThrow({
    resourceType,
    authContext,
    operationType,
    cost = 1,
  }: {
    resourceType: UsageResourceType;
    authContext: WorkspaceAuthContext;
    operationType: UsageOperationType;
    cost?: number;
  }): Promise<void> {
    const outcome = await this.consumeAdmittingOnFailure({
      resourceType,
      authContext,
      operationType,
      cost,
    });

    if (outcome.admitted) {
      return;
    }

    throw new UsageLimitException(
      `Rate limit exceeded for ${outcome.exhausted.spenderType}: ${outcome.exhausted.refillPerWindow} requests per ${outcome.exhausted.windowMs / 1000}s.`,
      UsageLimitExceptionCode.RATE_LIMITED,
      {
        exhaustedScope: {
          resourceType,
          limitKind: 'speed',
          spenderType: outcome.exhausted.spenderType,
          spenderId: outcome.exhausted.spenderId,
          limitValue: outcome.exhausted.refillPerWindow,
          remaining: 0,
          windowSeconds: Math.ceil(outcome.exhausted.windowMs / 1000),
          retryAfterMs: outcome.retryAfterMs,
        },
      },
    );
  }

  // Resolving the rules touches Redis too, so it belongs inside the guard: a
  // rate limiter that has lost its counter must not take the API down with it.
  private async consumeAdmittingOnFailure({
    resourceType,
    authContext,
    operationType,
    cost,
  }: {
    resourceType: UsageResourceType;
    authContext: WorkspaceAuthContext;
    operationType: UsageOperationType;
    cost: number;
  }): Promise<SpeedBucketOutcome> {
    try {
      const buckets = await this.buildBuckets({
        resourceType,
        authContext,
        operationType,
      });

      if (buckets.length === 0) {
        return ADMITTED;
      }

      return await this.consumeTokens({ buckets, cost });
    } catch (error) {
      this.logger.error(
        `Usage limit enforcement degraded: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return ADMITTED;
    }
  }

  private async consumeTokens({
    buckets,
    cost,
  }: {
    buckets: SpeedBucketRequest[];
    cost: number;
  }): Promise<SpeedBucketOutcome> {
    const bucketConfigs = buckets.map((bucket) => ({
      burst: bucket.burst,
      refill: bucket.refillPerWindow,
      windowMs: bucket.windowMs,
    }));

    const [admitted, failedIndex, retryAfterMs, ...remainingByBucket] =
      await this.cacheStorage.runScript<number[]>({
        script: TRY_CONSUME_TOKEN_BUCKETS_SCRIPT,
        keys: buckets.map((bucket) => bucket.key),
        args: [String(cost), JSON.stringify(bucketConfigs)],
      });

    if (admitted === 1) {
      return { admitted: true, remainingByBucket };
    }

    const exhausted = buckets[failedIndex - 1];

    if (!isDefined(exhausted)) {
      this.logger.warn(
        `try-consume-token-buckets returned an out-of-range index ${failedIndex}`,
      );

      return ADMITTED;
    }

    return { admitted: false, exhausted, retryAfterMs };
  }

  private async buildBuckets({
    resourceType,
    authContext,
    operationType,
  }: {
    resourceType: UsageResourceType;
    authContext: WorkspaceAuthContext;
    operationType: UsageOperationType;
  }): Promise<SpeedBucketRequest[]> {
    const definition = findUsageLimitDefinition({
      resourceType,
      limitKind: 'speed',
    });

    if (!isDefined(definition)) {
      return [];
    }

    const { usageLimitRules } = await this.workspaceCacheService.getOrRecompute(
      authContext.workspace.id,
      ['usageLimitRules'],
    );

    return buildSpeedBuckets({
      resolvedFallbacks: definition.fallbacks.map((fallback) => ({
        spenderType: fallback.spenderType,
        counterScope: fallback.counterScope,
        maxTokens: this.twentyConfigService.get(
          fallback.maxTokensConfigVariable,
        ),
        windowMs: this.twentyConfigService.get(fallback.windowMsConfigVariable),
      })),
      rules: usageLimitRules.byResourceType[resourceType] ?? [],
      authContext,
      resourceType,
      operationType,
    });
  }
}
