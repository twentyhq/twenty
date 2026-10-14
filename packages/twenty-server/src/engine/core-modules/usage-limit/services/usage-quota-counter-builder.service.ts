import { Injectable, Logger } from '@nestjs/common';

import uniqBy from 'lodash.uniqby';
import { isDefined } from 'twenty-shared/utils';

import { BillingCreditAllowanceService } from 'src/engine/core-modules/billing/services/billing-credit-allowance.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UsageLimitDefaultValueService } from 'src/engine/core-modules/usage-limit/services/usage-limit-default-value.service';
import { UsageLimitEntitlementService } from 'src/engine/core-modules/usage-limit/services/usage-limit-entitlement.service';
import { UsagePeriodService } from 'src/engine/core-modules/usage-limit/services/usage-period.service';
import { type WorkspaceAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/workspace-allowance-quota-counter.type';
import { type FlatQuotaLimit } from 'src/engine/core-modules/usage-limit/types/flat-quota-limit.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';
import { type QuotaLimitDefault } from 'src/engine/core-modules/usage-limit/types/quota-limit-default.type';
import { buildWorkspaceAllowanceCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-workspace-allowance-counter-key.util';
import { buildQuotaCounters } from 'src/engine/core-modules/usage-limit/utils/build-quota-counters.util';
import { buildSpendersFromUsageSpenders } from 'src/engine/core-modules/usage-limit/utils/build-spenders-from-usage-spenders.util';
import { computeCreditAllowanceMicro } from 'src/engine/core-modules/usage-limit/utils/compute-credit-allowance-micro.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { isQuotaLimit } from 'src/engine/core-modules/usage-limit/utils/is-quota-limit.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { isValidCreditAmountMicro } from 'src/engine/core-modules/usage/utils/is-valid-credit-amount-micro.util';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type QuotaCounterEvent } from 'src/engine/core-modules/usage-limit/types/quota-counter-event.type';

type QuotaCounterScope = {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
};

const buildCounterKeySignature = (counters: LimitQuotaCounter[]): string =>
  counters
    .map((counter) => counter.key)
    .sort()
    .join(' ');

@Injectable()
export class UsageQuotaCounterBuilderService {
  private readonly logger = new Logger(UsageQuotaCounterBuilderService.name);

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly usagePeriodService: UsagePeriodService,
    private readonly billingCreditAllowanceService: BillingCreditAllowanceService,
    private readonly usageLimitEntitlementService: UsageLimitEntitlementService,
    private readonly usageLimitDefaultValueService: UsageLimitDefaultValueService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async buildQuotaCountersForEvents({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: QuotaCounterEvent[];
  }): Promise<{
    limitCounters: LimitQuotaCounter[];
    userCreditCounters: LimitQuotaCounter[][];
  }> {
    const scopeEvents = uniqBy(events, (event) =>
      JSON.stringify([
        event.resourceType,
        event.operationType,
        buildSpendersFromUsageSpenders(event.spenders ?? {}),
      ]),
    );

    const countersByScopeEvent = await Promise.all(
      scopeEvents.map(({ resourceType, operationType, spenders }) =>
        this.buildQuotaCountersForScope({
          workspaceId,
          resourceType,
          operationType,
          spenders: spenders ?? {},
        }),
      ),
    );

    return {
      limitCounters: uniqBy(
        countersByScopeEvent
          .flat()
          .filter((counter) => counter.unit !== UsageUnit.USER_CREDIT),
        (counter) => counter.key,
      ),
      userCreditCounters: countersByScopeEvent.map((counters) =>
        counters.filter((counter) => counter.unit === UsageUnit.USER_CREDIT),
      ),
    };
  }

  async buildWorkspaceAllowanceCounterAdmittingOnFailure(
    workspaceId: string,
  ): Promise<{
    workspaceAllowanceCounter: WorkspaceAllowanceQuotaCounter | null;
    isWorkspaceAllowanceSkipped: boolean;
  }> {
    try {
      return {
        workspaceAllowanceCounter:
          await this.buildWorkspaceAllowanceCounter(workspaceId),
        isWorkspaceAllowanceSkipped: false,
      };
    } catch (error) {
      if (error instanceof WorkspaceCacheException) {
        throw error;
      }

      this.logger.error(
        `Usage quota allowance skipped for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return {
        workspaceAllowanceCounter: null,
        isWorkspaceAllowanceSkipped: true,
      };
    }
  }

  async buildWorkspaceAllowanceCounter(
    workspaceId: string,
  ): Promise<WorkspaceAllowanceQuotaCounter | null> {
    if (
      !(await this.billingCreditAllowanceService.isCreditAllowanceEnabled())
    ) {
      return null;
    }

    const allowance =
      await this.billingCreditAllowanceService.getCreditAllowance(workspaceId);

    if (!isDefined(allowance)) {
      return null;
    }

    return {
      kind: 'workspaceAllowance',
      key: buildWorkspaceAllowanceCounterKey({
        workspaceId,
        periodStart: allowance.periodStart,
      }),
      limitValue: computeCreditAllowanceMicro({
        planAllowanceMicro: allowance.planAllowanceMicro,
        grants: allowance.grants,
        nowMs: Date.now(),
      }),
      unit: UsageUnit.CREDIT,
      periodStart: allowance.periodStart,
      periodEnd: allowance.periodEnd,
    };
  }

  async buildUserAllowanceCounters({
    workspaceId,
    userCreditCounters,
  }: {
    workspaceId: string;
    userCreditCounters: LimitQuotaCounter[][];
  }): Promise<UserAllowanceQuotaCounter[]> {
    const [scopeUserCreditCounters = []] = userCreditCounters;
    const scopeKeys = buildCounterKeySignature(scopeUserCreditCounters);

    if (
      scopeUserCreditCounters.length === 0 ||
      !userCreditCounters.every(
        (counters) => buildCounterKeySignature(counters) === scopeKeys,
      ) ||
      !scopeUserCreditCounters.every(
        (counter) =>
          isValidCreditAmountMicro(counter.limitValue) &&
          counter.limitValue > 0,
      )
    ) {
      return [];
    }

    try {
      const fallback =
        await this.billingCreditAllowanceService.getUserCreditsFallback(
          workspaceId,
        );

      return scopeUserCreditCounters.map((counter) => ({
        ...counter,
        kind: 'userAllowance',
        fallback,
      }));
    } catch (error) {
      this.logger.error(
        `User credits unavailable for workspace ${workspaceId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );

      return [];
    }
  }

  private async buildQuotaCountersForScope({
    workspaceId,
    resourceType,
    operationType,
    spenders,
  }: QuotaCounterScope): Promise<LimitQuotaCounter[]> {
    const definition = findUsageLimitDefinition({
      resourceType,
      limitKind: 'quota',
    });

    if (!isDefined(definition)) {
      return [];
    }

    const quotaLimitDefaults = await this.buildQuotaLimitDefaults({
      workspaceId,
      resourceType,
    });

    const quotaLimits = await this.findQuotaLimits({
      workspaceId,
      resourceType,
    });

    if (quotaLimits.length === 0 && quotaLimitDefaults.length === 0) {
      return [];
    }

    return buildQuotaCounters({
      limits: quotaLimits,
      quotaLimitDefaults,
      usageSpenders: spenders,
      workspaceId,
      operationType,
      periodByUnit: await this.usagePeriodService.findCurrentPeriodsByUnit({
        workspaceId,
        periodUnits: [
          ...quotaLimits.map((limit) => limit.periodUnit),
          ...quotaLimitDefaults.map(
            (quotaLimitDefault) => quotaLimitDefault.periodUnit,
          ),
        ],
      }),
    });
  }

  private async buildQuotaLimitDefaults({
    workspaceId,
    resourceType,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
  }): Promise<QuotaLimitDefault[]> {
    if (!this.twentyConfigService.get('CLICKHOUSE_URL')) {
      return [];
    }

    const definition = findUsageLimitDefinition({
      resourceType,
      limitKind: 'quota',
    });

    const quotaLimitDefaults = await Promise.all(
      (definition?.defaults ?? []).map(
        async ({
          limitValueConfigVariable,
          ...quotaLimitDefaultDefinition
        }) => {
          const limitValue =
            await this.usageLimitDefaultValueService.findDefaultLimitValue({
              workspaceId,
              limitValueConfigVariable,
            });

          return isDefined(limitValue)
            ? [{ ...quotaLimitDefaultDefinition, limitValue }]
            : [];
        },
      ),
    );

    return quotaLimitDefaults.flat();
  }

  private async findQuotaLimits({
    workspaceId,
    resourceType,
  }: {
    workspaceId: string;
    resourceType: UsageResourceType;
  }): Promise<FlatQuotaLimit[]> {
    const { usageLimits } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['usageLimits'],
    );

    const quotaLimits = (usageLimits.byResourceType[resourceType] ?? []).filter(
      isQuotaLimit,
    );

    return this.usageLimitEntitlementService.findEnforceableLimits({
      workspaceId,
      limits: quotaLimits,
    });
  }
}
