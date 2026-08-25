import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

import { TRY_CONSUME_TOKEN_BUCKETS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/try-consume-token-buckets-script.constant';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type SpeedBucketOutcome } from 'src/engine/core-modules/usage-limit/types/speed-bucket-outcome.type';

import { buildSpendersFromAuthContext } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-auth-context.util';
import { buildSpeedBucketKey } from 'src/engine/core-modules/usage-limit/utils/build-speed-bucket-key.util';

import { SPENDER_TYPE_SPECIFICITY } from 'src/engine/core-modules/usage-limit/constants/spender-type-specificity.constant';
import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';
import { buildServerSpeedBucketKey } from 'src/engine/core-modules/usage-limit/utils/build-server-speed-bucket-key.util';
import { findRulesForSpender } from 'src/engine/core-modules/usage-limit/utils/find-rules-for-spender.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { getApplicationUniversalIdentifier } from 'src/engine/core-modules/usage-limit/utils/get-application-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

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
    const buckets = await this.buildSpeedBuckets({
      resourceType,
      authContext,
      operationType,
    });

    if (buckets.length === 0) {
      return;
    }

    const outcome = await this.consumeTokensAdmittingOnFailure({
      buckets,
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

  private async consumeTokensAdmittingOnFailure({
    buckets,
    cost,
  }: {
    buckets: SpeedBucketRequest[];
    cost: number;
  }): Promise<SpeedBucketOutcome> {
    try {
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

        return { admitted: true, remainingByBucket: [] };
      }

      return { admitted: false, exhausted, retryAfterMs };
    } catch (error) {
      this.logger.error(
        `Usage limit enforcement degraded: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return { admitted: true, remainingByBucket: [] };
    }
  }

  private async buildSpeedBuckets({
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
    const workspaceId = authContext.workspace.id;
    const spenders = buildSpendersFromAuthContext(authContext);

    const { usageLimitRules } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimitRules'],
    );

    const rules = usageLimitRules.byResourceType[resourceType] ?? [];
    const buckets: SpeedBucketRequest[] = [];

    for (const spender of spenders) {
      const spenderRules = findRulesForSpender({
        rules,
        spender,
        operationType,
      });

      if (spenderRules.length > 0) {
        for (const rule of spenderRules) {
          buckets.push({
            key: buildSpeedBucketKey({
              workspaceId,
              resourceType,
              operationType,
              spenderType: spender.spenderType,
              spenderId: spender.spenderId,
              windowSeconds: rule.windowSeconds,
            }),
            burst: rule.burstValue ?? rule.limitValue,
            refillPerWindow: rule.limitValue,
            windowMs: rule.windowSeconds * 1000,
            spenderType: spender.spenderType,
            spenderId: spender.spenderId,
          });
        }

        continue;
      }

      for (const fallback of definition.fallbacks) {
        if (fallback.spenderType !== spender.spenderType) {
          continue;
        }

        const maxTokens = this.twentyConfigService.get(
          fallback.maxTokensConfigVariable,
        ) as number;
        const windowMs = this.twentyConfigService.get(
          fallback.windowMsConfigVariable,
        ) as number;

        const windowSeconds = Math.ceil(windowMs / 1000);

        if (fallback.counterScope === 'crossWorkspace') {
          const universalIdentifier =
            getApplicationUniversalIdentifier(authContext);

          if (!isDefined(universalIdentifier)) {
            continue;
          }

          buckets.push({
            key: buildServerSpeedBucketKey({
              resourceType,
              operationType,
              spenderType: spender.spenderType,
              spenderId: universalIdentifier,
              windowSeconds,
            }),
            burst: maxTokens,
            refillPerWindow: maxTokens,
            windowMs,
            spenderType: spender.spenderType,
            spenderId: universalIdentifier,
          });

          continue;
        }

        buckets.push({
          key: buildSpeedBucketKey({
            workspaceId,
            resourceType,
            operationType,
            spenderType: spender.spenderType,
            spenderId: spender.spenderId,
            windowSeconds,
          }),
          burst: maxTokens,
          refillPerWindow: maxTokens,
          windowMs,
          spenderType: spender.spenderType,
          spenderId: spender.spenderId,
        });
      }
    }

    return buckets.sort(
      (a, b) =>
        SPENDER_TYPE_SPECIFICITY[a.spenderType] -
        SPENDER_TYPE_SPECIFICITY[b.spenderType],
    );
  }
}
