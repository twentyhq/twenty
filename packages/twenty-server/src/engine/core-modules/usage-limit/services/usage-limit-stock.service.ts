import { Injectable, Logger } from '@nestjs/common';

import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import {
  CacheLockException,
  CacheLockExceptionCode,
} from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { type CacheScript } from 'src/engine/core-modules/cache-storage/types/cache-script.type';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { CONSUME_QUOTA_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/consume-quota-counters-script.constant';
import { RELEASE_STOCK_COUNTERS_SCRIPT } from 'src/engine/core-modules/usage-limit/constants/release-stock-counters-script.constant';
import { STOCK_METERS } from 'src/engine/core-modules/usage-limit/constants/usage-meters.constant';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';
import { type StockCost } from 'src/engine/core-modules/usage-limit/types/stock-cost.type';
import { type StockCounter } from 'src/engine/core-modules/usage-limit/types/stock-counter.type';
import { type StockMeter } from 'src/engine/core-modules/usage-limit/types/stock-meter.type';
import { buildStockCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter-key.util';
import { buildStockCounter } from 'src/engine/core-modules/usage-limit/utils/build-stock-counter.util';
import { buildStockExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-stock-exhausted-scope.util';
import { buildStockWarmedEntries } from 'src/engine/core-modules/usage-limit/utils/build-stock-warmed-entries.util';
import { buildStockScopeKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-scope-key.util';
import { buildStockWarmLockKey } from 'src/engine/core-modules/usage-limit/utils/build-stock-warm-lock-key.util';
import { findExhaustedStockCounter } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-stock-counter.util';
import { findStockLimitsForSpenders } from 'src/engine/core-modules/usage-limit/utils/find-stock-limits-for-spenders.util';
import { isStockLimit } from 'src/engine/core-modules/usage-limit/utils/is-stock-limit.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const STOCK_COUNTER_TTL_MS = 2 * 24 * 60 * 60 * 1000;
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
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly cacheLockService: CacheLockService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly metricsService: MetricsService,
  ) {}

  async assertStockAvailable({
    cost,
    ...args
  }: StockArgs & { cost: StockCost }): Promise<void> {
    try {
      const counters = await this.buildCounters(args);

      if (counters.length === 0) {
        return;
      }

      const remainings = await this.readRemainings({
        workspaceId: args.workspaceId,
        counters,
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
          { exhaustedScope: buildStockExhaustedScope(exhausted) },
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
    spenderType,
    spenderId,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
    spenderType: SpenderType;
    spenderId: string;
  }) {
    const keys = STOCK_METERS.map((meter) =>
      buildStockCounterKey({
        workspaceId,
        resourceType,
        spenderType,
        spenderId,
        meter,
      }),
    );

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
    const { usageLimits } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimits'],
    );

    const stockLimits = (usageLimits.byResourceType[resourceType] ?? []).filter(
      isStockLimit,
    );

    if (stockLimits.length === 0) {
      return [];
    }

    const enforceableLimits =
      await this.usageLimitEntitlementService.findEnforceableLimits({
        workspaceId,
        limits: stockLimits,
      });

    return findStockLimitsForSpenders({
      limits: enforceableLimits,
      usageSpenders: spenders,
      operationType,
    }).map((limit) => buildStockCounter({ workspaceId, limit }));
  }

  private async readRemainings({
    workspaceId,
    counters,
  }: {
    workspaceId: string;
    counters: StockCounter[];
  }): Promise<(number | null)[]> {
    const remainings = await this.cacheStorage.mget<number>(
      counters.map((counter) => counter.key),
    );

    if (remainings.every(isDefined)) {
      return remainings;
    }

    return this.warmColdCounters({ workspaceId, counters });
  }

  private async warmColdCounters({
    workspaceId,
    counters,
  }: {
    workspaceId: string;
    counters: StockCounter[];
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
                  await this.computeUsedStock({ workspaceId, counter }),
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

  private computeUsedStock({
    workspaceId,
    counter,
  }: {
    workspaceId: string;
    counter: StockCounter;
  }): Promise<Record<StockMeter, number>> {
    switch (counter.resourceType) {
      case UsageResourceType.STORAGE:
        return this.computeStorageUsedStock({ workspaceId, counter });
      default:
        return assertUnreachable(counter.resourceType);
    }
  }

  private async computeStorageUsedStock({
    workspaceId,
    counter,
  }: {
    workspaceId: string;
    counter: StockCounter;
  }): Promise<Record<StockMeter, number>> {
    const query = this.fileRepository
      .createQueryBuilder('file')
      .select('COUNT(*)::bigint', 'quantity')
      .addSelect('COALESCE(SUM(file.size), 0)::bigint', 'bytes')
      .where('file.workspaceId = :workspaceId', { workspaceId })
      .withDeleted();

    if (counter.spenderType === 'application') {
      query.andWhere('file.applicationId = :applicationId', {
        applicationId: counter.spenderId,
      });
    }

    const used = await query.getRawOne<{ quantity: string; bytes: string }>();

    return {
      quantity: Number(used?.quantity ?? 0),
      bytes: Number(used?.bytes ?? 0),
    };
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
