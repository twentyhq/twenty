/* @license Enterprise */

import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import {
  computePlanWorkspaceCreditsMicro,
  type PlanWorkspaceCreditsMicro,
} from 'src/engine/core-modules/billing/utils/compute-plan-workspace-credits-micro.util';
import { getCurrentPeriodMaxSeats } from 'src/engine/core-modules/billing/utils/get-current-period-max-seats.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class ResourceCreditService {
  protected readonly logger = new Logger(ResourceCreditService.name);

  constructor(
    @InjectWorkspaceScopedRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: WorkspaceScopedRepository<BillingSubscriptionEntity>,
  ) {}

  async getResourceCreditRolloverParameters({
    workspaceId,
    subscriptionId,
    boundary,
  }: {
    workspaceId: string;
    subscriptionId: string;
    boundary: Date;
  }): Promise<PlanWorkspaceCreditsMicro | null> {
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

    const closingPeriodMaxSeats =
      subscription.currentPeriodStart.getTime() === boundary.getTime()
        ? (subscription.previousPeriodMaxSeats ?? 0)
        : getCurrentPeriodMaxSeats(subscription);

    const planWorkspaceCredits = computePlanWorkspaceCreditsMicro({
      billingSubscriptionItems: subscription.billingSubscriptionItems,
      interval: subscription.interval,
      seats: closingPeriodMaxSeats,
    });

    if (
      !isDefined(planWorkspaceCredits) ||
      planWorkspaceCredits.workspaceCreditsForPackMicro +
        planWorkspaceCredits.workspaceCreditsForSeatsMicro <=
        0
    ) {
      return null;
    }

    return planWorkspaceCredits;
  }
}
