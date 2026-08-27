import { Injectable, Logger } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageException } from 'src/engine/core-modules/cache-storage/exceptions/cache-storage.exception';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SETTLE_QUOTA_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/settle-quota-counters-script.constant';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageAllowanceResolverRegistry } from 'src/engine/core-modules/usage-limit/services/usage-allowance-resolver-registry.service';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type QuotaCounterRequest } from 'src/engine/core-modules/usage-limit/types/quota-counter-request.type';
import { type UsageCell } from 'src/engine/core-modules/usage-limit/types/usage-cell.type';
import { type UsageSpenders } from 'src/engine/core-modules/usage-limit/types/usage-spenders.type';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { sumUsageForQuotaCounter } from 'src/engine/core-modules/usage-limit/utils/sum-usage-for-quota-counter.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsagePeriod } from 'src/engine/core-modules/usage/types/usage-period.type';
import { UsagePeriodService } from 'src/engine/core-modules/usage/services/usage-period.service';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type QuotaConsumptionRequest = {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
};

type UsageSumRow = {
  operationType: string;
  userWorkspaceId: string;
  apiKeyId: string;
  applicationId: string;
  agentId: string;
  workflowId: string;
  logicFunctionId: string;
  total: string | number | null;
};

// This gate runs before every quota-metered execution, so it waits far less
// than the warm path holds the lock and admits rather than failing the
// execution when contention wins.
const QUOTA_WARM_UP_LOCK_OPTIONS = {
  ms: 50,
  maxRetries: 20,
  ttl: 10_000,
};

const buildQuotaWarmUpLockKey = (workspaceId: string): string =>
  `usage-quota-warm:${workspaceId}`;

@Injectable()
export class UsageLimitQuotaService {
  private readonly logger = new Logger(UsageLimitQuotaService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineUsageLimit)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly usagePeriodService: UsagePeriodService,
    private readonly usageAllowanceResolverRegistry: UsageAllowanceResolverRegistry,
    private readonly cacheLockService: CacheLockService,
    private readonly clickHouseService: ClickHouseService,
  ) {}

  async assertCanConsume(request: QuotaConsumptionRequest): Promise<void> {
    const context = await this.buildContext(request);

    if (!isDefined(context)) {
      return;
    }

    const { counters, period } = context;

    const remainingByKey = await this.readRemainingWarmingCold({
      workspaceId: request.workspaceId,
      counters,
      period,
    });

    if (!isDefined(remainingByKey)) {
      return;
    }

    const exhausted = counters.find((counter) => {
      const remaining = remainingByKey.get(counter.key);

      return isDefined(remaining) && remaining <= 0;
    });

    if (!isDefined(exhausted)) {
      return;
    }

    throw new UsageLimitException(
      `Usage quota exhausted for ${exhausted.spenderType}: ${exhausted.limitValue} per period.`,
      UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      {
        exhaustedScope: this.buildExhaustedScope({
          counter: exhausted,
          remaining: remainingByKey.get(exhausted.key) ?? 0,
          resourceType: request.resourceType,
          period,
        }),
      },
    );
  }

  // Deliberately does not throw: mid-run callers stop gracefully on the
  // returned scope, after the cost that crossed the line is already spent.
  async settle(
    request: QuotaConsumptionRequest & { cost: number },
  ): Promise<{ exhausted: ExhaustedScope | null }> {
    const context = await this.buildContext(request);

    if (!isDefined(context) || request.cost <= 0) {
      return { exhausted: null };
    }

    const { counters, period } = context;

    let remainders: (number | null)[];

    try {
      remainders = await this.cacheStorage.runScript<(number | null)[]>({
        script: SETTLE_QUOTA_COUNTERS_SCRIPT,
        keys: counters.map((counter) => counter.key),
        args: [String(Math.ceil(request.cost))],
      });
    } catch (error) {
      if (!(error instanceof CacheStorageException)) {
        throw error;
      }

      this.logger.error(`Quota settlement degraded: ${error.message}`);

      return { exhausted: null };
    }

    const exhaustedIndex = counters.findIndex((counter, index) => {
      const remaining = remainders[index];

      return isDefined(remaining) && remaining <= 0;
    });

    if (exhaustedIndex === -1) {
      return { exhausted: null };
    }

    return {
      exhausted: this.buildExhaustedScope({
        counter: counters[exhaustedIndex],
        remaining: remainders[exhaustedIndex] ?? 0,
        resourceType: request.resourceType,
        period,
      }),
    };
  }

  private async buildContext(
    request: QuotaConsumptionRequest,
  ): Promise<{ counters: QuotaCounterRequest[]; period: UsagePeriod } | null> {
    const { workspaceId, resourceType, operationType, spenders } = request;

    const isEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_USAGE_QUOTA_V2_ENABLED,
      workspaceId,
    );

    if (!isEnabled) {
      return null;
    }

    const definition = findUsageLimitDefinition({
      resourceType,
      limitKind: 'quota',
    });

    if (!isDefined(definition)) {
      return null;
    }

    const rules = await this.findRulesAdmittingOnFailure({
      workspaceId,
      resourceType,
    });

    if (!isDefined(rules)) {
      return null;
    }

    const [period, allowance] = await Promise.all([
      this.usagePeriodService.getCurrentPeriod(workspaceId),
      this.usageAllowanceResolverRegistry.resolveUsageAllowance(workspaceId),
    ]);

    const counters = buildQuotaCounters({
      definition,
      rules,
      workspaceId,
      resourceType,
      operationType,
      spenders,
      allowance,
      periodStart: period.periodStart,
    });

    if (counters.length === 0) {
      return null;
    }

    return { counters, period };
  }

  // Null means enforcement degraded (Redis down): admit.
  private async readRemainingWarmingCold({
    workspaceId,
    counters,
    period,
  }: {
    workspaceId: string;
    counters: QuotaCounterRequest[];
    period: UsagePeriod;
  }): Promise<Map<string, number> | null> {
    let values: (number | undefined)[];

    try {
      values = await this.cacheStorage.mget<number>(
        counters.map((counter) => counter.key),
      );
    } catch (error) {
      if (!(error instanceof CacheStorageException)) {
        throw error;
      }

      this.logger.error(`Quota enforcement degraded: ${error.message}`);

      return null;
    }

    const remainingByKey = new Map<string, number>();
    const coldCounters: QuotaCounterRequest[] = [];

    counters.forEach((counter, index) => {
      const value = values[index];

      if (isDefined(value)) {
        remainingByKey.set(counter.key, value);
      } else {
        coldCounters.push(counter);
      }
    });

    if (coldCounters.length === 0) {
      return remainingByKey;
    }

    const warmed = await this.warmCounters({
      workspaceId,
      coldCounters,
      period,
    });

    for (const [key, remaining] of warmed) {
      remainingByKey.set(key, remaining);
    }

    return remainingByKey;
  }

  // A burst of cold reads pays ClickHouse once: the lock single-flights the
  // warm-up, and whoever waited re-reads what the winner installed. Every
  // failure path admits by leaving counters cold — warming from a failed read
  // would hand out the whole period's budget again.
  private async warmCounters({
    workspaceId,
    coldCounters,
    period,
  }: {
    workspaceId: string;
    coldCounters: QuotaCounterRequest[];
    period: UsagePeriod;
  }): Promise<Map<string, number>> {
    try {
      return await this.cacheLockService.withLock(
        async () => {
          const values = await this.cacheStorage.mget<number>(
            coldCounters.map((counter) => counter.key),
          );

          const warmed = new Map<string, number>();
          const stillCold: QuotaCounterRequest[] = [];

          coldCounters.forEach((counter, index) => {
            const value = values[index];

            if (isDefined(value)) {
              warmed.set(counter.key, value);
            } else {
              stillCold.push(counter);
            }
          });

          if (stillCold.length === 0) {
            return warmed;
          }

          const installed = await this.computeAndInstallBudgets({
            workspaceId,
            counters: stillCold,
            period,
          });

          for (const [key, remaining] of installed) {
            warmed.set(key, remaining);
          }

          return warmed;
        },
        buildQuotaWarmUpLockKey(workspaceId),
        QUOTA_WARM_UP_LOCK_OPTIONS,
      );
    } catch (error) {
      this.logger.warn(
        `Admitting without warming quota counters for workspace ${workspaceId}: ${
          error instanceof Error ? error.message : error
        }`,
      );

      return new Map();
    }
  }

  private async computeAndInstallBudgets({
    workspaceId,
    counters,
    period,
  }: {
    workspaceId: string;
    counters: QuotaCounterRequest[];
    period: UsagePeriod;
  }): Promise<Map<string, number>> {
    const cellsByScope = await this.readUsageCells({
      workspaceId,
      counters,
      periodStart: period.periodStart,
    });

    const ttlMs = Math.max(period.periodEnd.getTime() - Date.now(), 0);
    const installed = new Map<string, number>();

    for (const counter of counters) {
      const cells = cellsByScope.get(
        buildCellScopeKey(counter.resourceType, counter.meter),
      );

      if (!isDefined(cells)) {
        continue;
      }

      const used = sumUsageForQuotaCounter({ counter, cells });

      const remaining = counter.limitValue - used;

      await this.cacheStorage.set(counter.key, remaining, ttlMs);
      installed.set(counter.key, remaining);
    }

    return installed;
  }

  // One aggregate query per (resource, meter) scope — never one per counter.
  // Returns only the scopes whose read succeeded; counters of a failed scope
  // stay cold.
  private async readUsageCells({
    workspaceId,
    counters,
    periodStart,
  }: {
    workspaceId: string;
    counters: QuotaCounterRequest[];
    periodStart: Date;
  }): Promise<Map<string, UsageCell[]>> {
    const scopes = new Map<
      string,
      { resourceType: QuotaCounterRequest['resourceType']; meter: string }
    >();

    for (const counter of counters) {
      scopes.set(buildCellScopeKey(counter.resourceType, counter.meter), {
        resourceType: counter.resourceType,
        meter: counter.meter,
      });
    }

    const cellsByScope = new Map<string, UsageCell[]>();

    await Promise.all(
      Array.from(scopes.entries()).map(async ([scopeKey, scope]) => {
        try {
          const rows = await this.clickHouseService.selectOrThrow<UsageSumRow>(
            `SELECT operationType, userWorkspaceId, apiKeyId, applicationId, agentId, workflowId, logicFunctionId, sum(${scope.meter}) AS total
             FROM usageEvent
             WHERE workspaceId = {workspaceId:String}
               ${scope.resourceType === '' ? '' : 'AND resourceType = {resourceType:String}'}
               AND periodStart = {periodStart:DateTime64(3)}
             GROUP BY operationType, userWorkspaceId, apiKeyId, applicationId, agentId, workflowId, logicFunctionId`,
            {
              workspaceId,
              resourceType: scope.resourceType,
              periodStart: formatDateTimeForClickHouse(periodStart),
            },
          );

          cellsByScope.set(
            scopeKey,
            rows.map((row) => ({
              operationType: row.operationType,
              userWorkspaceId: row.userWorkspaceId,
              apiKeyId: row.apiKeyId,
              applicationId: row.applicationId,
              agentId: row.agentId,
              workflowId: row.workflowId,
              logicFunctionId: row.logicFunctionId,
              total: toFiniteNumber(row.total),
            })),
          );
        } catch (error) {
          this.logger.error(
            `Quota warm-up read failed for workspace ${workspaceId}: ${
              error instanceof Error ? error.message : error
            }`,
          );
        }
      }),
    );

    return cellsByScope;
  }

  private async findRulesAdmittingOnFailure({
    workspaceId,
    resourceType,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
  }): Promise<FlatUsageLimit[] | null> {
    try {
      const { usageLimitRules } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'usageLimitRules',
        ]);

      return usageLimitRules.byResourceType[resourceType] ?? [];
    } catch (error) {
      if (error instanceof WorkspaceCacheException) {
        throw error;
      }

      this.logger.error(
        'Usage limit rules unavailable, quota enforcement degraded',
        error,
      );

      return null;
    }
  }

  private buildExhaustedScope({
    counter,
    remaining,
    resourceType,
    period,
  }: {
    counter: QuotaCounterRequest;
    remaining: number;
    resourceType: UsageResourceType;
    period: UsagePeriod;
  }): ExhaustedScope {
    return {
      resourceType,
      operationType:
        counter.operationType === '' ? null : counter.operationType,
      limitKind: 'quota',
      spenderType: counter.spenderType,
      spenderId: counter.spenderId,
      limitValue: counter.limitValue,
      remaining: Math.max(remaining, 0),
      windowSeconds: 0,
      retryAfterMs: 0,
      periodEnd: period.periodEnd,
      isFallback: counter.isFallback,
    };
  }
}

const buildCellScopeKey = (
  resourceType: QuotaCounterRequest['resourceType'],
  meter: string,
): string => `${resourceType || 'ALL'}:${meter}`;

const toFiniteNumber = (value: string | number | null): number => {
  const parsed = typeof value === 'string' ? Number(value) : (value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
};
