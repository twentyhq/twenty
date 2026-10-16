/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type CreditAvailability } from 'src/engine/core-modules/billing/types/credit-availability.type';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { buildUsageRefusalException } from 'src/engine/core-modules/billing/utils/build-usage-refusal-exception.util';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
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

@Injectable()
export class UsageQuotaAdmissionService {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
  ) {}

  async assertUsageAllowed(scope: UsageQuotaScope): Promise<void> {
    const usageRefusal = await this.findUsageRefusal(scope);

    if (isDefined(usageRefusal)) {
      throw buildUsageRefusalException({
        usageRefusal,
        workspaceId: scope.workspaceId,
      });
    }
  }

  async findUsageRefusal({
    workspaceId,
    resourceType,
    operationType,
    spenders,
    cost,
  }: UsageQuotaScope): Promise<UsageRefusal | null> {
    const subscriptionInactiveReason =
      await this.billingUsageService.getSubscriptionInactiveReason(workspaceId);

    if (isDefined(subscriptionInactiveReason)) {
      return {
        kind: 'subscriptionInactive',
        reason: subscriptionInactiveReason,
      };
    }

    const exhaustedScope = await this.usageLimitQuotaService.findExhaustedScope(
      { workspaceId, resourceType, operationType, spenders, cost },
    );

    return isDefined(exhaustedScope)
      ? { kind: 'quotaExhausted', exhaustedScope }
      : null;
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
      await this.usageLimitQuotaService.getWorkspaceAllowanceRemainingMicro(
        workspaceId,
      );

    if (isDefined(remainingMicro) && remainingMicro <= 0) {
      return { hasAvailableCredits: false, reason: 'NO_CREDITS' };
    }

    return { hasAvailableCredits: true };
  }
}
