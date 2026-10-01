import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CONSUME_QUOTA_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/consume-quota-counters-script.constant';
import { RELEASE_STOCK_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/release-stock-counters-script.constant';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { type ComputeUsedStock } from 'src/engine/core-modules/usage-limit/types/compute-used-stock.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockCost } from 'src/engine/core-modules/usage-limit/types/stock-cost.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { type StockLimitDefault } from 'src/engine/core-modules/usage-limit/types/stock-limit-default.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';
import { buildStockCounters } from 'src/engine/core-modules/usage-limit/utils/build-stock-counters.util';
import { buildStockDefaultCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-default-counter-key.util';
import { buildStockExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-stock-exhausted-scope.util';
import { buildStockWarmedEntries } from 'src/engine/core-modules/usage-limit/utils/build-stock-warmed-entries.util';
import { buildStockScopeKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-scope-key.util';
import { buildStockWarmLockKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-warm-lock-key.util';
import { findExhaustedStockCounter } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-stock-counter.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { getStockExhaustedUserFriendlyMessage } from 'src/engine/core-modules/usage-limit/utils/get-stock-exhausted-user-friendly-message.util';
import { isStockLimit } from 'src/engine/core-modules/usage-limit/utils/is-stock-limit.util';
import { isStockResourceType } from 'src/engine/core-modules/usage-limit/utils/is-stock-resource-type.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const STOCK_COUNTER_TTL_MS = 60 * 60 * 1000;
const STOCK_WARM_LOCK_OPTIONS = { ms: 50, maxRetries: 20, ttl: 10_000 };

type StockArgs = {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
};

@Injectable()
export class UsageLimitStockService {
  private readonly logger = new Logger(UsageLimitStockService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineUsageLimit)
    private readonly cacheStorage: CacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly cacheLockService: CacheLockService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly metricsService: MetricsService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async assertStockAvailable({
    cost,
    computeUsedStock,
    ...args
  }: StockArgs & {
    cost: StockCost;
    computeUsedStock: ComputeUsedStock;
  }): Promise<void> {
    try {
      const counters = await this.buildCounters(args);

      if (counters.length === 0) {
        return;
      }

      const remainings = await this.readRemainings({
        workspaceId: args.workspaceId,
        counters,
        computeUsedStock,
      });

      const exhausted = findExhaustedStockCounter({
        counters,
        remainings,
        cost,
      });

      if (isDefined(exhausted)) {
        throw new UsageLimitException(
          `${exhausted.counter.resourceType} limit reached for this workspace`,
          UsageLimitExceptionCode.STOCK_EXHAUSTED,
          {
            userFriendlyMessage: getStockExhaustedUserFriendlyMessage(
              exhausted.counter.resourceType,
            ),
            exhaustedScope: buildStockExhaustedScope(exhausted),
          },
        );
      }
    } catch (error) {
      this.admitOnFailure({ error, workspaceId: args.workspaceId });
    }
  }

  async acquireStock({
    cost,
    ...args
  }: StockArgs & { cost: StockCost }): Promise<void> {
    await this.applyStockDelta({
      ...args,
      cost,
      script: CONSUME_QUOTA_COUNTERS_SCRIPT,
      buildArgs: (counters) => [
        JSON.stringify(counters.map((counter) => cost[counter.meter] ?? 0)),
      ],
    });
  }

  async releaseStock({
    cost,
    ...args
  }: StockArgs & { cost: StockCost }): Promise<void> {
    await this.applyStockDelta({
      ...args,
      cost,
      script: RELEASE_STOCK_COUNTERS_SCRIPT,
      buildArgs: (counters) => [
        JSON.stringify(counters.map((counter) => cost[counter.meter] ?? 0)),
        JSON.stringify(counters.map((counter) => counter.limitValue)),
      ],
    });
  }

  async dropStockCounters({
    workspaceId,
    resourceType,
    operationType,
    spenderType,
    spenderId,
    meter,
    limitValue,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    operationType: UsageOperationType;
    spenderType: SpenderType;
    spenderId: string | null;
    meter: StockMeter;
    limitValue: number;
  }) {
    const keys = [
      buildStockCounterKey({
        workspaceId,
        resourceType,
        operationType,
        spenderType,
        spenderId,
        meter,
        limitValue,
      }),
    ];

    if (isStockResourceType(resourceType)) {
      keys.push(
        ...this.buildStockLimitDefaults({ resourceType, operationType })
          .filter(
            (stockLimitDefault) =>
              stockLimitDefault.spenderType === spenderType,
          )
          .map((stockLimitDefault) =>
            buildStockDefaultCounterKey({
              workspaceId,
              resourceType,
              operationType,
              spenderType,
              meter: stockLimitDefault.meter,
              limitValue: stockLimitDefault.limitValue,
            }),
          ),
      );
    }

    await this.dropCounterKeys({ workspaceId, keys });
  }

  async invalidateStock(args: StockArgs): Promise<void> {
    try {
      const counters = await this.buildCounters(args);

      if (counters.length === 0) {
        return;
      }

      await this.dropCounterKeys({
        workspaceId: args.workspaceId,
        keys: counters.map((counter) => counter.key),
      });
    } catch (error) {
      this.recordDegradation({ error, workspaceId: args.workspaceId });
    }
  }

  private async dropCounterKeys({
    workspaceId,
    keys,
  }: {
    workspaceId: string;
    keys: string[];
  }): Promise<void> {
    try {
      await this.cacheLockService.withLock(
        () => this.cacheStorage.mdel(keys),
        buildStockWarmLockKey(workspaceId),
        STOCK_WARM_LOCK_OPTIONS,
      );
    } catch (error) {
      if (
        !(error instanceof CacheLockException) ||
        error.code !== CacheLockExceptionCode.LOCK_ACQUISITION_TIMEOUT
      ) {
        throw error;
      }

      this.logger.warn(
        `Dropping stock counters ${keys.join(', ')} without the warm lock: ${error.message}`,
      );

      await this.cacheStorage.mdel(keys);
    }
  }

  private async applyStockDelta({
    cost,
    script,
    buildArgs,
    ...args
  }: StockArgs & {
    cost: StockCost;
    script: CacheScript;
    buildArgs: (counters: StockCounter[]) => string[];
  }): Promise<void> {
    try {
      const counters = (await this.buildCounters(args)).filter(
        (counter) => (cost[counter.meter] ?? 0) > 0,
      );

      if (counters.length === 0) {
        return;
      }

      await this.cacheStorage.runScript({
        script,
        keys: counters.map((counter) => counter.key),
        args: buildArgs(counters),
      });
    } catch (error) {
      this.recordDegradation({ error, workspaceId: args.workspaceId });
    }
  }

  private async buildCounters({
    workspaceId,
    resourceType,
    operationType,
    spenders,
  }: StockArgs): Promise<StockCounter[]> {
    if (!isStockResourceType(resourceType)) {
      return [];
    }

    const { usageLimits } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimits'],
    );

    const enforceableLimits =
      await this.usageLimitEntitlementService.findEnforceableLimits({
        workspaceId,
        limits: (usageLimits.byResourceType[resourceType] ?? []).filter(
          isStockLimit,
        ),
      });

    return buildStockCounters({
      workspaceId,
      resourceType,
      operationType,
      spenders,
      limits: enforceableLimits,
      stockLimitDefaults: this.buildStockLimitDefaults({
        resourceType,
        operationType,
      }),
    });
  }

  private buildStockLimitDefaults({
    resourceType,
    operationType,
  }: {
    resourceType: StockResourceType;
    operationType: UsageOperationType;
  }): StockLimitDefault[] {
    const definition = findUsageLimitDefinition({
      resourceType,
      limitKind: 'stock',
    });

    return (definition?.defaults ?? [])
      .filter(
        (stockLimitDefaultDefinition) =>
          stockLimitDefaultDefinition.operationType === operationType,
      )
      .map((stockLimitDefaultDefinition) => ({
        spenderType: stockLimitDefaultDefinition.spenderType,
        meter: stockLimitDefaultDefinition.meter,
        isOverridable: stockLimitDefaultDefinition.isOverridable,
        limitValue: this.twentyConfigService.get(
          stockLimitDefaultDefinition.limitValueConfigVariable,
        ),
      }));
  }

  private async readRemainings({
    workspaceId,
    counters,
    computeUsedStock,
  }: {
    workspaceId: string;
    counters: StockCounter[];
    computeUsedStock: ComputeUsedStock;
  }): Promise<(number | null)[]> {
    const remainings = await this.cacheStorage.mget<number>(
      counters.map((counter) => counter.key),
    );

    if (remainings.every(isDefined)) {
      return remainings;
    }

    return this.warmColdCounters({ workspaceId, counters, computeUsedStock });
  }

  private async warmColdCounters({
    workspaceId,
    counters,
    computeUsedStock,
  }: {
    workspaceId: string;
    counters: StockCounter[];
    computeUsedStock: ComputeUsedStock;
  }): Promise<(number | null)[]> {
    return this.cacheLockService.withLock(
      async () => {
        const remainings = await this.cacheStorage.mget<number>(
          counters.map((counter) => counter.key),
        );

        if (remainings.every(isDefined)) {
          return remainings;
        }

        const coldCounters = counters.filter(
          (_, index) => !isDefined(remainings[index]),
        );

        const scopeKeys = [
          ...new Map(
            coldCounters.map((counter) => [
              buildStockScopeKey(counter),
              counter,
            ]),
          ).entries(),
        ];

        const usedByScope = new Map(
          await Promise.all(
            scopeKeys.map(
              async ([scopeKey, counter]) =>
                [
                  scopeKey,
                  await computeUsedStock({
                    spenderType: counter.spenderType,
                    spenderId: counter.spenderId,
                  }),
                ] as const,
            ),
          ),
        );

        const warmedEntries = buildStockWarmedEntries({
          coldCounters,
          usedByScope,
          ttl: STOCK_COUNTER_TTL_MS,
        });

        await this.cacheStorage.mset(warmedEntries);

        const warmedValueByKey = new Map(
          warmedEntries.map((entry) => [entry.key, entry.value]),
        );

        return counters.map(
          (counter, index) =>
            remainings[index] ?? warmedValueByKey.get(counter.key) ?? null,
        );
      },
      buildStockWarmLockKey(workspaceId),
      STOCK_WARM_LOCK_OPTIONS,
    );
  }

  private admitOnFailure({
    error,
    workspaceId,
  }: {
    error: unknown;
    workspaceId: string;
  }): void {
    if (error instanceof UsageLimitException) {
      throw error;
    }

    this.recordDegradation({ error, workspaceId });
  }

  private recordDegradation({
    error,
    workspaceId,
  }: {
    error: unknown;
    workspaceId: string;
  }): void {
    this.logger.error(
      `Usage stock enforcement degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
    );

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.UsageLimitStockAdmittedOnFailure,
      amount: 1,
    });
  }
}
