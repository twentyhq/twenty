/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type CreditAvailability } from 'src/engine/core-modules/billing/types/credit-availability.type';
import { type UsageAdmission } from 'src/engine/core-modules/billing/types/usage-admission.type';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { buildUsageRefusalException } from 'src/engine/core-modules/billing/utils/build-usage-refusal-exception.util';
import { UsageQuotaConsumptionService } from 'src/engine/core-modules/usage-limit/services/usage-quota-consumption.service';
import { UsageQuotaCounterBuilderService } from 'src/engine/core-modules/usage-limit/services/usage-quota-counter-builder.service';
import { UsageQuotaCounterStoreService } from 'src/engine/core-modules/usage-limit/services/usage-quota-counter-store.service';
import { type QuotaAdmission } from 'src/engine/core-modules/usage-limit/types/quota-admission.type';
import { type QuotaCounter } from 'src/engine/core-modules/usage-limit/types/quota-counter.type';
import { type QuotaEnforcement } from 'src/engine/core-modules/usage-limit/types/quota-enforcement.type';
import { buildQuotaExhaustedScope } from 'src/engine/core-modules/usage-limit/utils/build-quota-exhausted-scope.util';
import { findExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/find-exhausted-counters.util';
import { selectUserAllowanceFirstExhaustedCounters } from 'src/engine/core-modules/usage-limit/utils/select-user-allowance-first-exhausted-counters.util';
import { type QuotaCost } from 'src/engine/core-modules/usage-limit/types/quota-cost.type';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';

type UsageQuotaScope = {
  workspaceId: string;
  resourceType: UsageResourceType;
  operationType: UsageOperationType;
  spenders: UsageSpenders;
  cost?: QuotaCost;
};

const QUOTA_ADMISSION_WITHOUT_USER_ALLOWANCE_COUNTER: QuotaAdmission = {
  exhaustedScope: null,
  hasUserAllowanceCounter: false,
  hasUserCreditsLeft: false,
  hasWorkspaceCreditsLeft: true,
};

@Injectable()
export class UsageQuotaAdmissionService {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    private readonly usageQuotaCounterBuilderService: UsageQuotaCounterBuilderService,
    private readonly usageQuotaCounterStoreService: UsageQuotaCounterStoreService,
    private readonly usageQuotaConsumptionService: UsageQuotaConsumptionService,
  ) {}

  async assertUsageAllowed(
    scope: UsageQuotaScope,
  ): Promise<Pick<UsageAdmission, 'hasWorkspaceCreditsLeft'>> {
    const { refusal, hasWorkspaceCreditsLeft } =
      await this.findUsageAdmission(scope);

    if (isDefined(refusal)) {
      throw buildUsageRefusalException({
        usageRefusal: refusal,
        workspaceId: scope.workspaceId,
      });
    }

    return { hasWorkspaceCreditsLeft };
  }

  async findUsageRefusal(scope: UsageQuotaScope): Promise<UsageRefusal | null> {
    const { refusal } = await this.findUsageAdmission(scope);

    return refusal;
  }

  async findUsageAdmission({
    workspaceId,
    resourceType,
    operationType,
    spenders,
    cost,
    requireUserAllowanceCounter,
  }: UsageQuotaScope & {
    requireUserAllowanceCounter?: boolean;
  }): Promise<UsageAdmission> {
    const subscriptionInactiveReason =
      await this.billingUsageService.getSubscriptionInactiveReason(workspaceId);

    if (isDefined(subscriptionInactiveReason)) {
      return {
        refusal: {
          kind: 'subscriptionInactive',
          reason: subscriptionInactiveReason,
        },
        hasUserAllowanceCounter: false,
        hasUserCreditsLeft: false,
        hasWorkspaceCreditsLeft: false,
      };
    }

    const { exhaustedScope, ...userAllowanceAdmission } =
      await this.findQuotaAdmission({
        workspaceId,
        resourceType,
        operationType,
        spenders,
        cost,
        requireUserAllowanceCounter,
      });

    return {
      refusal: isDefined(exhaustedScope)
        ? { kind: 'quotaExhausted', exhaustedScope }
        : null,
      ...userAllowanceAdmission,
    };
  }

  async getCreditAvailability(
    workspaceId: string,
  ): Promise<CreditAvailability> {
    const subscriptionInactiveReason =
      await this.billingUsageService.getSubscriptionInactiveReason(workspaceId);

    if (isDefined(subscriptionInactiveReason)) {
      return { hasAvailableCredits: false, reason: subscriptionInactiveReason };
    }

    const remainingMicro =
      await this.getWorkspaceAllowanceRemainingMicro(workspaceId);

    if (isDefined(remainingMicro) && remainingMicro <= 0) {
      return { hasAvailableCredits: false, reason: 'NO_CREDITS' };
    }

    return { hasAvailableCredits: true };
  }

  async hasAvailableCredits(workspaceId: string): Promise<boolean> {
    const { hasAvailableCredits } =
      await this.getCreditAvailability(workspaceId);

    return hasAvailableCredits;
  }

  async findQuotaAdmission({
    requireUserAllowanceCounter = false,
    ...args
  }: UsageQuotaScope & {
    requireUserAllowanceCounter?: boolean;
  }): Promise<QuotaAdmission> {
    const enforcement: QuotaEnforcement = {
      operation: 'assert',
      resourceType: args.resourceType,
    };

    try {
      return await this.findAdmissionFromCounters({
        ...args,
        requireUserAllowanceCounter,
        enforcement,
      });
    } catch (error) {
      return this.usageQuotaCounterStoreService.admitOnFailure({
        error,
        workspaceId: args.workspaceId,
        enforcement,
        admitted: QUOTA_ADMISSION_WITHOUT_USER_ALLOWANCE_COUNTER,
      });
    }
  }

  private async getWorkspaceAllowanceRemainingMicro(
    workspaceId: string,
  ): Promise<number | null> {
    try {
      const usage =
        await this.usageQuotaConsumptionService.getWorkspaceAllowanceUsage(
          workspaceId,
        );

      if (!isDefined(usage) || !isDefined(usage.consumedValue)) {
        return null;
      }

      return usage.limitValue - usage.consumedValue;
    } catch (error) {
      return this.usageQuotaCounterStoreService.admitOnFailure({
        error,
        workspaceId,
        admitted: null,
      });
    }
  }

  private async findAdmissionFromCounters({
    cost,
    requireUserAllowanceCounter,
    enforcement,
    ...args
  }: UsageQuotaScope & {
    requireUserAllowanceCounter: boolean;
    enforcement: QuotaEnforcement;
  }): Promise<QuotaAdmission> {
    const { workspaceId, resourceType, operationType, spenders } = args;
    const events = [{ resourceType, operationType, spenders }];

    const [
      { limitCounters, userCreditCounters },
      { workspaceAllowanceCounter, isWorkspaceAllowanceSkipped },
    ] = await Promise.all([
      this.usageQuotaCounterBuilderService.buildQuotaCountersForEvents({
        workspaceId,
        events,
      }),
      this.usageQuotaCounterBuilderService.buildWorkspaceAllowanceCounterAdmittingOnFailure(
        workspaceId,
      ),
    ]);

    const userAllowanceCounters =
      await this.usageQuotaCounterBuilderService.buildUserAllowanceCounters({
        workspaceId,
        userCreditCounters,
      });

    if (requireUserAllowanceCounter && userAllowanceCounters.length === 0) {
      return QUOTA_ADMISSION_WITHOUT_USER_ALLOWANCE_COUNTER;
    }

    const counters: QuotaCounter[] = [
      ...limitCounters,
      ...(isDefined(workspaceAllowanceCounter)
        ? [workspaceAllowanceCounter]
        : []),
    ];

    const [
      { consumedValues, isDegraded },
      {
        consumedValues: userAllowanceConsumedValues,
        isDegraded: isUserAllowanceDegraded,
      },
    ] = await Promise.all([
      this.usageQuotaCounterStoreService.readCountersAdmittingOnFailure({
        workspaceId,
        counters,
      }),
      this.usageQuotaCounterStoreService.readCountersAdmittingOnFailure({
        workspaceId,
        counters: userAllowanceCounters,
      }),
    ]);

    if (isDegraded || isUserAllowanceDegraded || isWorkspaceAllowanceSkipped) {
      this.usageQuotaCounterStoreService.countAdmitOnFailure(enforcement);
    }

    const { exhaustedCounters, ...userAllowanceAdmission } =
      selectUserAllowanceFirstExhaustedCounters({
        exhaustedCounters: findExhaustedCounters({
          counters: [...counters, ...userAllowanceCounters],
          consumedValues: [...consumedValues, ...userAllowanceConsumedValues],
          cost,
        }),
        userAllowanceCounters,
        userAllowanceConsumedValues,
        workspaceAllowanceConsumed: isDefined(workspaceAllowanceCounter)
          ? (consumedValues[counters.indexOf(workspaceAllowanceCounter)] ??
            null)
          : null,
      });

    const exhaustedScopes = exhaustedCounters.map((counter) =>
      buildQuotaExhaustedScope({ resourceType, operationType, counter }),
    );

    const [latestUserAllowanceScope] = exhaustedScopes
      .filter((scope) => scope.exhaustedKind === 'userAllowance')
      .sort((first, second) => second.retryAfterMs - first.retryAfterMs);

    const exhaustedScope =
      exhaustedScopes.find(
        (scope) => scope.exhaustedKind === 'workspaceAllowance',
      ) ??
      latestUserAllowanceScope ??
      exhaustedScopes[0] ??
      null;

    return { exhaustedScope, ...userAllowanceAdmission };
  }
}
