import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageException } from 'src/engine/core-modules/cache-storage/exceptions/cache-storage.exception';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  TOKEN_BUCKETS_ALLOW_PARTIAL_ARG,
  TOKEN_BUCKETS_DENY_PARTIAL_ARG,
  TRY_CONSUME_TOKEN_BUCKETS_SCRIPT,
} from 'src/engine/core-modules/usage-limit/constants/try-consume-token-buckets-script.constant';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type SpeedBucketOutcome } from 'src/engine/core-modules/usage-limit/types/speed-bucket-outcome.type';
import { type SpeedBucketRequest } from 'src/engine/core-modules/usage-limit/types/speed-bucket-request.type';
import { type UsageLimits } from 'src/engine/core-modules/usage-limit/types/usage-limits.type';
import { buildSpeedBuckets } from 'src/engine/core-modules/usage-limit/utils/build-speed-buckets.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class UsageLimitSpeedService {
  private readonly logger = new Logger(UsageLimitSpeedService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineUsageLimit)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
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
    const outcome = await this.tryConsume({
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
          exhaustedKind: 'limit',
          spenderType: outcome.exhausted.spenderType,
          spenderId: outcome.exhausted.spenderId,
          operationType,
          limitValue: outcome.exhausted.refillPerWindow,
          burstValue: outcome.exhausted.burst,
          remaining: 0,
          periodCount: Math.ceil(outcome.exhausted.windowMs / 1000),
          periodUnit: 'second',
          retryAfterMs: outcome.retryAfterMs,
          isDefault: outcome.exhausted.isDefault,
        },
      },
    );
  }

  async tryConsume({
    resourceType,
    authContext,
    operationType,
    cost = 1,
  }: {
    resourceType: UsageResourceType;
    authContext: WorkspaceAuthContext;
    operationType: UsageOperationType;
    cost?: number;
  }): Promise<SpeedBucketOutcome> {
    return await this.consumeAdmittingOnFailure({
      resourceType,
      authContext,
      operationType,
      cost,
      allowPartial: false,
    });
  }

  async tryConsumeUpTo({
    resourceType,
    authContext,
    operationType,
    maxCost,
  }: {
    resourceType: UsageResourceType;
    authContext: WorkspaceAuthContext;
    operationType: UsageOperationType;
    maxCost: number;
  }): Promise<SpeedBucketOutcome> {
    return await this.consumeAdmittingOnFailure({
      resourceType,
      authContext,
      operationType,
      cost: maxCost,
      allowPartial: true,
    });
  }

  private async consumeAdmittingOnFailure({
    resourceType,
    authContext,
    operationType,
    cost,
    allowPartial,
  }: {
    resourceType: UsageResourceType;
    authContext: WorkspaceAuthContext;
    operationType: UsageOperationType;
    cost: number;
    allowPartial: boolean;
  }): Promise<SpeedBucketOutcome> {
    const fullAdmission: SpeedBucketOutcome = {
      admitted: true,
      admittedCount: cost,
    };

    const buckets = await this.buildBuckets({
      resourceType,
      authContext,
      operationType,
    });

    if (buckets.length === 0) {
      return fullAdmission;
    }

    try {
      return await this.consumeTokens({ buckets, cost, allowPartial });
    } catch (error) {
      if (!(error instanceof CacheStorageException)) {
        throw error;
      }

      this.logger.error(`Usage limit enforcement degraded: ${error.message}`);

      return fullAdmission;
    }
  }

  private async consumeTokens({
    buckets,
    cost,
    allowPartial,
  }: {
    buckets: SpeedBucketRequest[];
    cost: number;
    allowPartial: boolean;
  }): Promise<SpeedBucketOutcome> {
    const bucketConfigs = buckets.map((bucket) => ({
      burst: bucket.burst,
      refill: bucket.refillPerWindow,
      windowMs: bucket.windowMs,
    }));

    const [admittedCount, exhaustedIndex, retryAfterMs] =
      await this.cacheStorage.runScript<number[]>({
        script: TRY_CONSUME_TOKEN_BUCKETS_SCRIPT,
        keys: buckets.map((bucket) => bucket.key),
        args: [
          String(cost),
          JSON.stringify(bucketConfigs),
          allowPartial
            ? TOKEN_BUCKETS_ALLOW_PARTIAL_ARG
            : TOKEN_BUCKETS_DENY_PARTIAL_ARG,
        ],
      });

    if (admittedCount === cost) {
      return { admitted: true, admittedCount };
    }

    const exhausted = buckets[exhaustedIndex - 1];

    if (!isDefined(exhausted)) {
      this.logger.warn(
        `try-consume-token-buckets returned an out-of-range index ${exhaustedIndex}`,
      );

      return { admitted: true, admittedCount: cost };
    }

    return { admitted: false, admittedCount, exhausted, retryAfterMs };
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

    const limits = await this.findLimitsAdmittingOnFailure({
      workspaceId: authContext.workspace.id,
      resourceType,
    });

    if (!isDefined(limits)) {
      return [];
    }

    const enforceableLimits =
      await this.usageLimitEntitlementService.findEnforceableLimits({
        workspaceId: authContext.workspace.id,
        limits,
      });

    return buildSpeedBuckets({
      speedLimitDefaults: definition.defaults.map(
        (speedLimitDefaultDefinition) => ({
          spenderType: speedLimitDefaultDefinition.spenderType,
          counterScope: speedLimitDefaultDefinition.counterScope,
          isOverridable: speedLimitDefaultDefinition.isOverridable,
          maxTokens: this.twentyConfigService.get(
            speedLimitDefaultDefinition.limitValueConfigVariable,
          ),
          windowMs: this.twentyConfigService.get(
            speedLimitDefaultDefinition.windowMsConfigVariable,
          ),
        }),
      ),
      limits: enforceableLimits,
      authContext,
      resourceType,
      operationType,
    });
  }

  private async findLimitsAdmittingOnFailure({
    workspaceId,
    resourceType,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
  }): Promise<FlatUsageLimit[] | null> {
    let usageLimits: UsageLimits;

    try {
      ({ usageLimits } = await this.workspaceCacheService.getOrRecompute(
        workspaceId,
        ['usageLimits'],
      ));
    } catch (error) {
      if (error instanceof WorkspaceCacheException) {
        throw error;
      }

      this.logger.error(
        'Usage limits unavailable, enforcement degraded',
        error,
      );

      return null;
    }

    return usageLimits.byResourceType[resourceType] ?? [];
  }
}
