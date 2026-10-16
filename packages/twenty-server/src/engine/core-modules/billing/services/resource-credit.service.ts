/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingPlanAllowanceService } from 'src/engine/core-modules/billing/services/billing-plan-allowance.service';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
export type ResourceCreditPricingInfo = {
  tierCap: number;
  unitPriceCents: number;
};

@Injectable()
export class ResourceCreditService {
  protected readonly logger = new Logger(ResourceCreditService.name);

  constructor(
    private readonly billingPlanAllowanceService: BillingPlanAllowanceService,
    @InjectWorkspaceScopedRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: WorkspaceScopedRepository<BillingSubscriptionEntity>,
  ) {}

  extractResourceCreditPricingInfo(
    subscription: BillingSubscriptionEntity,
  ): ResourceCreditPricingInfo | null {
    const resourceCreditItem = subscription.billingSubscriptionItems?.find(
      (item) =>
        item.billingProduct?.metadata?.productKey ===
        BillingProductKey.RESOURCE_CREDIT,
    );

    if (!isDefined(resourceCreditItem)) {
      return null;
    }

    const matchingPrice =
      resourceCreditItem.billingProduct?.billingPrices?.find(
        (price) => price.stripePriceId === resourceCreditItem.stripePriceId,
      );

    if (!isDefined(matchingPrice)) {
      return null;
    }

    const tierCap = Number(matchingPrice.metadata?.credit_amount ?? 0);

    if (!Number.isFinite(tierCap) || tierCap <= 0) {
      return null;
    }

    return {
      tierCap,
      unitPriceCents: matchingPrice.unitAmount ?? 0,
    };
  }

  async getResourceCreditRolloverParameters(
    workspaceId: string,
    subscriptionId: string,
    {
      closingPeriodStart,
      closingPeriodEnd,
      nextPeriodStart,
    }: {
      closingPeriodStart: Date;
      closingPeriodEnd: Date;
      nextPeriodStart: Date;
    },
  ): Promise<{
    closingAllowanceMicro: number;
    nextAllowanceMicro: number;
  } | null> {
    const subscription = await this.billingSubscriptionRepository.findOne(
      workspaceId,
      {
        where: { id: subscriptionId },
        relations: [
          'billingSubscriptionItems',
          'billingSubscriptionItems.billingProduct',
          'billingSubscriptionItems.billingProduct.billingPrices',
        ],
      },
    );

    if (!isDefined(subscription)) {
      return null;
    }

    const closingAllowance =
      await this.billingPlanAllowanceService.computeAllowance(subscription, {
        periodStart: closingPeriodStart,
        periodEnd: closingPeriodEnd,
      });
    const nextAllowance =
      await this.billingPlanAllowanceService.computeAllowance(subscription, {
        periodStart: nextPeriodStart,
        atPeriodStart: true,
      });
    const closingAllowanceMicro = closingAllowance.planAllowanceMicro ?? 0;
    const nextAllowanceMicro = nextAllowance.planAllowanceMicro ?? 0;

    return closingAllowanceMicro > 0 || nextAllowanceMicro > 0
      ? { closingAllowanceMicro, nextAllowanceMicro }
      : null;
  }
}
