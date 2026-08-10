/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Not, Raw, Repository } from 'typeorm';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';

@Injectable()
export class BillingUsageCapService {
  constructor(
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
  ) {}

  async setSubscriptionItemHasReachedCap(
    workspaceId: string,
    hasReachedCap: boolean,
  ): Promise<void> {
    const billingSubscriptionItems =
      await this.findResourceCreditSubscriptionItems(workspaceId);

    if (billingSubscriptionItems.length !== 1) {
      throw new BillingException(
        `Expected 1 billing subscription item for workspace ${workspaceId}, but got ${billingSubscriptionItems.length}`,
        BillingExceptionCode.BILLING_SUBSCRIPTION_ITEM_NOT_FOUND,
      );
    }

    await this.billingSubscriptionItemRepository.update(
      { id: billingSubscriptionItems[0].id },
      { hasReachedCurrentPeriodCap: hasReachedCap },
    );
  }

  // Lifting the cap must never fail the operation that granted the credits, so
  // unlike setSubscriptionItemHasReachedCap this tolerates a workspace with no
  // resource credit item.
  async clearHasReachedCapForWorkspace(workspaceId: string): Promise<void> {
    const billingSubscriptionItems =
      await this.findResourceCreditSubscriptionItems(workspaceId);

    if (billingSubscriptionItems.length === 0) {
      return;
    }

    await this.billingSubscriptionItemRepository.update(
      { id: In(billingSubscriptionItems.map((item) => item.id)) },
      { hasReachedCurrentPeriodCap: false },
    );
  }

  private async findResourceCreditSubscriptionItems(
    workspaceId: string,
  ): Promise<BillingSubscriptionItemEntity[]> {
    return this.billingSubscriptionItemRepository.find({
      where: {
        billingSubscription: {
          workspaceId,
          status: Not(SubscriptionStatus.Canceled),
        },
        billingProduct: {
          metadata: Raw((alias) => `${alias} @> :metadata::jsonb`, {
            metadata: JSON.stringify({
              productKey: BillingProductKey.RESOURCE_CREDIT,
            }),
          }),
        },
      },
    });
  }
}
