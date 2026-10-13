/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type CreditAvailability } from 'src/engine/core-modules/billing/types/credit-availability.type';
import { type UsageAdmission } from 'src/engine/core-modules/billing/types/usage-admission.type';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { buildUsageRefusalException } from 'src/engine/core-modules/billing/utils/build-usage-refusal-exception.util';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { type MemberCreditsPayer } from 'src/engine/core-modules/usage-limit/types/member-credits-payer.type';
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
  memberCreditsPayer?: MemberCreditsPayer;
};

@Injectable()
export class UsageQuotaAdmissionService {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
  ) {}

  async assertUsageAllowed(
    scope: UsageQuotaScope,
  ): Promise<Pick<UsageAdmission, 'isWorkspaceAllowanceAvailable'>> {
    const { refusal, isWorkspaceAllowanceAvailable } =
      await this.findUsageAdmission(scope);

    if (isDefined(refusal)) {
      throw buildUsageRefusalException({
        usageRefusal: refusal,
        workspaceId: scope.workspaceId,
      });
    }

    return { isWorkspaceAllowanceAvailable };
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
    memberCreditsPayer,
    requireMemberCounter,
  }: UsageQuotaScope & {
    requireMemberCounter?: boolean;
  }): Promise<UsageAdmission> {
    const subscriptionInactiveReason =
      await this.billingUsageService.getSubscriptionInactiveReason(workspaceId);

    if (isDefined(subscriptionInactiveReason)) {
      return {
        refusal: {
          kind: 'subscriptionInactive',
          reason: subscriptionInactiveReason,
        },
        hasMemberCounter: false,
        isMemberAllowanceAvailable: null,
        isWorkspaceAllowanceAvailable: null,
      };
    }

    const { exhaustedScope, ...memberAdmission } =
      await this.usageLimitQuotaService.findAdmission({
        workspaceId,
        resourceType,
        operationType,
        spenders,
        cost,
        memberCreditsPayer,
        requireMemberCounter,
      });

    return {
      refusal: isDefined(exhaustedScope)
        ? { kind: 'quotaExhausted', exhaustedScope }
        : null,
      ...memberAdmission,
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
      await this.usageLimitQuotaService.getAllowanceRemainingMicro(workspaceId);

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
}
