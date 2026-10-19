import { Injectable, Logger } from '@nestjs/common';

import uniqBy from 'lodash.uniqby';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WARM_AND_CONSUME_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/warm-and-consume-counters-script.constant';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitDefaultValueService } from 'src/engine/core-modules/usage-limit/services/usage-limit-default-value.service';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { type ComputeUsedStock } from 'src/engine/core-modules/usage-limit/types/compute-used-stock.type';
import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { type StockCost } from 'src/engine/core-modules/usage-limit/types/stock-cost.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { type StockLimitDefault } from 'src/engine/core-modules/usage-limit/types/stock-limit-default.type';
import { type StockResourceType } from 'src/engine/core-modules/usage-limit/types/stock-resource-type.type';
import { buildConsumeScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-consume-script-arguments.util';
import { buildIntraWorkspaceStockCounterKeys } from 'src/engine/core-modules/usage-limit/utils/build-intra-workspace-stock-counter-keys.util';
import { buildReleaseScriptArguments } from 'src/engine/core-modules/usage-limit/utils/build-release-script-arguments.util';
import { buildStockCounter } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter.util';
import { buildStockCounters } from 'src/engine/core-modules/usage-limit/utils/build-stock-counters.util';
import { buildStockExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-stock-exhausted-scope.util';
import { buildStockScopeKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-scope-key.util';
import { findSuppressedUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-suppressed-usage-limit-defaults.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { getStockExhaustedUserFriendlyMessage } from 'src/engine/core-modules/usage-limit/utils/get-stock-exhausted-user-friendly-message.util';
import { isLimitExhausted } from 'src/engine/core-modules/usage-limit/utils/is-limit-exhausted.util';
import { isStockLimit } from 'src/engine/core-modules/usage-limit/utils/is-stock-limit.util';
import { isStockResourceType } from 'src/engine/core-modules/usage-limit/utils/is-stock-resource-type.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const STOCK_COUNTER_TTL_MS = 60 * 60 * 1000;

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
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly usageLimitDefaultValueService: UsageLimitDefaultValueService,
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
      const counters = await this.buildChargedCounters({ ...args, cost });

      if (counters.length === 0) {
        return;
      }

      const heldValueByKey = await this.warmHeldValues({
        counters,
        computeUsedStock,
      });

      for (const counter of counters) {
        const held = heldValueByKey.get(counter.key);

        if (
          isDefined(held) &&
          isLimitExhausted({
            consumed: held,
            cost: cost[counter.unit] ?? 0,
            limitValue: counter.limitValue,
          })
        ) {
          throw new UsageLimitException(
            `${counter.resourceType} limit reached for this workspace`,
            UsageLimitExceptionCode.STOCK_EXHAUSTED,
            {
              userFriendlyMessage: getStockExhaustedUserFriendlyMessage(
                counter.resourceType,
              ),
              exhaustedScope: buildStockExhaustedScope({ counter, held }),
            },
          );
        }
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
      buildArguments: (amounts) =>
        buildConsumeScriptArguments({
          entries: amounts.map((amount) => ({ amount, warm: null })),
        }),
    });
  }

  async releaseStock({
    cost,
    ...args
  }: StockArgs & { cost: StockCost }): Promise<void> {
    await this.applyStockDelta({
      ...args,
      cost,
      buildArguments: buildReleaseScriptArguments,
    });
  }

  async dropLimitCounter({
    workspaceId,
    usageLimit,
  }: {
    workspaceId: string;
    usageLimit: FlatUsageLimit;
  }): Promise<void> {
    if (
      !isStockLimit(usageLimit) ||
      findSuppressedUsageLimitDefaults(usageLimit).some((usageLimitDefault) =>
        isDefined(
          this.twentyConfigService.get(
            usageLimitDefault.limitValueConfigVariable,
          ),
        ),
      )
    ) {
      return;
    }

    await this.cacheStorage.del(
      buildStockCounter({ workspaceId, limit: usageLimit }).key,
    );
  }

  async dropIntraWorkspaceLimitCounters(workspaceId: string): Promise<void> {
    const { usageLimits } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimits'],
    );

    await this.cacheStorage.mdel(
      buildIntraWorkspaceStockCounterKeys({
        workspaceId,
        limits: Object.values(usageLimits.byResourceType).flatMap(
          (limits) => limits ?? [],
        ),
      }),
    );
  }

  async invalidateStock(args: StockArgs): Promise<void> {
    try {
      const counters = await this.buildCounters(args);

      await this.cacheStorage.mdel(counters.map((counter) => counter.key));
    } catch (error) {
      this.recordDegradation({ error, workspaceId: args.workspaceId });
    }
  }

  private async applyStockDelta({
    cost,
    buildArguments,
    ...args
  }: StockArgs & {
    cost: StockCost;
    buildArguments: (amounts: number[]) => string[];
  }): Promise<void> {
    try {
      const counters = uniqBy(
        await this.buildChargedCounters({ ...args, cost }),
        (counter) => counter.key,
      );

      await this.runWarmAndConsumeScript({
        counters,
        args: buildArguments(
          counters.map((counter) => cost[counter.unit] ?? 0),
        ),
      });
    } catch (error) {
      this.recordDegradation({ error, workspaceId: args.workspaceId });
    }
  }

  private async buildChargedCounters({
    cost,
    ...args
  }: StockArgs & { cost: StockCost }): Promise<StockCounter[]> {
    return (await this.buildCounters(args)).filter(
      (counter) => (cost[counter.unit] ?? 0) > 0,
    );
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
      stockLimitDefaults: await this.buildStockLimitDefaults({
        workspaceId,
        resourceType,
        operationType,
      }),
    });
  }

  private async buildStockLimitDefaults({
    workspaceId,
    resourceType,
    operationType,
  }: {
    workspaceId: string;
    resourceType: StockResourceType;
    operationType: UsageOperationType;
  }): Promise<StockLimitDefault[]> {
    const definition = findUsageLimitDefinition({
      resourceType,
      limitKind: 'stock',
    });

    const stockLimitDefaults = await Promise.all(
      (definition?.defaults ?? [])
        .filter(
          (stockLimitDefaultDefinition) =>
            stockLimitDefaultDefinition.operationType === operationType,
        )
        .map(async (stockLimitDefaultDefinition) => {
          const limitValue =
            await this.usageLimitDefaultValueService.findDefaultLimitValue({
              workspaceId,
              limitValueConfigVariable:
                stockLimitDefaultDefinition.limitValueConfigVariable,
            });

          return isDefined(limitValue)
            ? [
                {
                  spenderType: stockLimitDefaultDefinition.spenderType,
                  unit: stockLimitDefaultDefinition.unit,
                  isOverridable: stockLimitDefaultDefinition.isOverridable,
                  limitValue,
                },
              ]
            : [];
        }),
    );

    return stockLimitDefaults.flat();
  }

  private async warmHeldValues({
    counters,
    computeUsedStock,
  }: {
    counters: StockCounter[];
    computeUsedStock: ComputeUsedStock;
  }): Promise<Map<string, number | null>> {
    const uniqueCounters = uniqBy(counters, (counter) => counter.key);

    const storedValues = await this.cacheStorage.mget<number>(
      uniqueCounters.map((counter) => counter.key),
    );

    const coldCounters = uniqueCounters.filter(
      (_, index) => !isDefined(storedValues[index]),
    );

    const warmValues = await this.fetchWarmValues({
      counters: coldCounters,
      computeUsedStock,
    });

    const warmedValues = await this.runWarmAndConsumeScript({
      counters: coldCounters,
      args: buildConsumeScriptArguments({
        entries: warmValues.map((warmValue) => ({
          amount: 0,
          warm: isDefined(warmValue)
            ? { value: warmValue, ttl: STOCK_COUNTER_TTL_MS }
            : null,
        })),
      }),
    });

    const warmedValueByKey = new Map(
      coldCounters.map((counter, index) => [counter.key, warmedValues[index]]),
    );

    return new Map(
      uniqueCounters.map((counter, index) => [
        counter.key,
        storedValues[index] ?? warmedValueByKey.get(counter.key) ?? null,
      ]),
    );
  }

  private async fetchWarmValues({
    counters,
    computeUsedStock,
  }: {
    counters: StockCounter[];
    computeUsedStock: ComputeUsedStock;
  }): Promise<(number | undefined)[]> {
    const usedStockReadsByScope = new Map<
      string,
      ReturnType<ComputeUsedStock>
    >();

    return Promise.all(
      counters.map(async (counter) => {
        const scopeKey = buildStockScopeKey(counter);

        const usedStockRead =
          usedStockReadsByScope.get(scopeKey) ??
          computeUsedStock({
            spenderType: counter.spenderType,
            spenderId: counter.spenderId,
          });

        usedStockReadsByScope.set(scopeKey, usedStockRead);

        return (await usedStockRead)[counter.unit];
      }),
    );
  }

  private async runWarmAndConsumeScript({
    counters,
    args,
  }: {
    counters: StockCounter[];
    args: string[];
  }): Promise<(number | null)[]> {
    if (counters.length === 0) {
      return [];
    }

    const results = await this.cacheStorage.runScript<unknown[]>({
      script: WARM_AND_CONSUME_COUNTERS_SCRIPT,
      keys: counters.map((counter) => counter.key),
      args,
    });

    return results.map((result) =>
      typeof result === 'number' ? result : null,
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
