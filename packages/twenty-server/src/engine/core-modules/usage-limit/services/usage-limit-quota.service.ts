import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageQuotaCounterService } from 'src/engine/core-modules/usage-limit/services/usage-quota-counter.service';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaCounterScope } from 'src/engine/core-modules/usage-limit/types/quota-counter-scope.type';
import { buildQuotaExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-quota-exhausted-scope.util';
import { clampQuotaCost } from 'src/engine/core-modules/usage-limit/utils/clamp-quota-cost.util';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';
import { isAdmittableQuotaFailure } from 'src/engine/core-modules/usage-limit/utils/is-admittable-quota-failure.util';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

type QuotaEnforcement = {
  operation: 'assert' | 'consume';
  resourceType: UsageResourceType;
  cost?: QuotaCost;
};

@Injectable()
export class UsageLimitQuotaService {
  private readonly logger = new Logger(UsageLimitQuotaService.name);

  constructor(
    private readonly usageQuotaCounterService: UsageQuotaCounterService,
    private readonly metricsService: MetricsService,
  ) {}

  async assertQuotaNotExhausted(scope: QuotaCounterScope): Promise<void> {
    const exhaustedScopes =
      await this.findExhaustedScopesAdmittingOnFailure(scope);

    const exhaustedScope =
      exhaustedScopes.find(
        (exhausted) => exhausted.exhaustedKind === 'allowance',
      ) ?? exhaustedScopes[0];

    if (isDefined(exhaustedScope)) {
      this.throwQuotaExhausted(exhaustedScope);
    }
  }

  async consumeQuota({
    cost,
    ...scope
  }: QuotaCounterScope & { cost: QuotaCost }): Promise<{
    exhausted: ExhaustedScope[];
  }> {
    const clampedCost = clampQuotaCost(cost);

    if (
      clampedCost.creditsUsedMicro !== cost.creditsUsedMicro ||
      clampedCost.quantity !== cost.quantity
    ) {
      this.logger.error(
        `Refusing to consume invalid quota cost ${JSON.stringify(cost)} for workspace ${scope.workspaceId}; treating it as 0`,
      );
    }

    return {
      exhausted: await this.consumeCountersAdmittingOnFailure({
        ...scope,
        cost: clampedCost,
      }),
    };
  }

  private async findExhaustedScopesAdmittingOnFailure(
    scope: QuotaCounterScope,
  ): Promise<ExhaustedScope[]> {
    try {
      const counters = await this.usageQuotaCounterService.buildCounters(scope);

      if (counters.length === 0) {
        return [];
      }

      const remainings = await this.usageQuotaCounterService.readRemainings({
        workspaceId: scope.workspaceId,
        counters,
      });

      return await this.buildExhaustedScopes({ scope, counters, remainings });
    } catch (error) {
      return this.admitOnFailure({
        error,
        workspaceId: scope.workspaceId,
        enforcement: { operation: 'assert', resourceType: scope.resourceType },
        admitted: [],
      });
    }
  }

  private async consumeCountersAdmittingOnFailure({
    cost,
    ...scope
  }: QuotaCounterScope & { cost: QuotaCost }): Promise<ExhaustedScope[]> {
    try {
      const counters = await this.usageQuotaCounterService.buildCounters(scope);

      if (counters.length === 0) {
        return [];
      }

      const remainings = await this.usageQuotaCounterService.consumeCounters({
        workspaceId: scope.workspaceId,
        counters,
        cost,
      });

      return await this.buildExhaustedScopes({ scope, counters, remainings });
    } catch (error) {
      return this.admitOnFailure({
        error,
        workspaceId: scope.workspaceId,
        enforcement: {
          operation: 'consume',
          resourceType: scope.resourceType,
          cost,
        },
        admitted: [],
      });
    }
  }

  private async buildExhaustedScopes({
    scope,
    counters,
    remainings,
  }: {
    scope: QuotaCounterScope;
    counters: QuotaCounter[];
    remainings: (number | null)[];
  }): Promise<ExhaustedScope[]> {
    const exhaustedCounters = findExhaustedCounters({ counters, remainings });

    if (exhaustedCounters.length === 0) {
      return [];
    }

    const allowance = exhaustedCounters.some(
      (counter) => counter.kind === 'allowance',
    )
      ? await this.usageQuotaCounterService.getCreditAllowance(
          scope.workspaceId,
        )
      : null;

    return exhaustedCounters.map((counter) =>
      buildQuotaExhaustedScope({
        resourceType: scope.resourceType,
        counter,
        allowance,
      }),
    );
  }

  private throwQuotaExhausted(exhaustedScope: ExhaustedScope): never {
    if (exhaustedScope.exhaustedKind === 'allowance') {
      throw new UsageLimitException(
        'Credit allowance exhausted for this billing period',
        UsageLimitExceptionCode.QUOTA_EXHAUSTED,
        {
          userFriendlyMessage: msg`Credit allowance exhausted for this billing period.`,
          exhaustedScope,
        },
      );
    }

    throw new UsageLimitException(
      `Usage limit reached for ${exhaustedScope.spenderType}`,
      UsageLimitExceptionCode.QUOTA_EXHAUSTED,
      { exhaustedScope },
    );
  }

  private admitOnFailure<TAdmitted>({
    error,
    workspaceId,
    enforcement,
    admitted,
  }: {
    error: unknown;
    workspaceId: string;
    enforcement: QuotaEnforcement;
    admitted: TAdmitted;
  }): TAdmitted {
    if (!isAdmittableQuotaFailure(error)) {
      throw error;
    }

    this.logger.error(
      `Usage quota enforcement degraded for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
    );

    this.countAdmitOnFailure(enforcement);

    return admitted;
  }

  private countAdmitOnFailure({
    operation,
    resourceType,
    cost,
  }: QuotaEnforcement): void {
    const attributes = { operation, resourceType };

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.UsageLimitQuotaAdmittedOnFailure,
      amount: 1,
      attributes,
    });

    if (isDefined(cost) && cost.creditsUsedMicro > 0) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.UsageLimitQuotaAdmittedOnFailureCreditsMicro,
        amount: cost.creditsUsedMicro,
        attributes,
      });
    }
  }
}
