import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Raw, Repository } from 'typeorm';

import { differenceInDays } from 'date-fns';
import chunk from 'lodash.chunk';
import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { FLUSH_CURRENT_BILLING_SUBSCRIPTION_BATCH_SIZE } from 'src/engine/core-modules/billing/constants/flush-current-billing-subscription-batch-size.constant';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class BillingSubscriptionItemService {
  private readonly logger = new Logger(BillingSubscriptionItemService.name);

  constructor(
    @InjectRepository(BillingSubscriptionItemEntity)
    private readonly billingSubscriptionItemRepository: Repository<BillingSubscriptionItemEntity>,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getResourceCreditSubscriptionItemDetails(
    subscription: BillingSubscriptionEntity,
  ): Promise<{
    stripeSubscriptionItemId: string;
    productKey: BillingProductKey;
    creditAmount: number;
    freeTrialQuantity: number;
    unitPriceCents: number;
  } | null> {
    const item = await this.billingSubscriptionItemRepository.findOne({
      where: {
        billingSubscriptionId: subscription.id,
        billingProduct: {
          metadata: Raw((alias) => `${alias} @> :metadata::jsonb`, {
            metadata: JSON.stringify({
              productKey: BillingProductKey.RESOURCE_CREDIT,
            }),
          }),
        },
      },
      relations: ['billingProduct', 'billingProduct.billingPrices'],
    });

    if (!item) {
      return null;
    }

    const price = this.findMatchingPrice(item);

    const trialDuration =
      isDefined(subscription.trialEnd) && isDefined(subscription.trialStart)
        ? differenceInDays(subscription.trialEnd, subscription.trialStart)
        : 0;

    const trialWithCreditCardDuration = this.twentyConfigService.get(
      'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
    );

    return {
      stripeSubscriptionItemId: item.stripeSubscriptionItemId,
      productKey: BillingProductKey.RESOURCE_CREDIT,
      creditAmount: Number(price.metadata?.credit_amount ?? 0),
      freeTrialQuantity: this.twentyConfigService.get(
        trialDuration === trialWithCreditCardDuration
          ? 'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITH_CREDIT_CARD'
          : 'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITHOUT_CREDIT_CARD',
      ),
      unitPriceCents: price.unitAmount ?? 0,
    };
  }

  async flushCurrentBillingSubscriptionForPrice(
    stripePriceId: string,
  ): Promise<void> {
    const workspaceIds =
      await this.findWorkspaceIdsSubscribedToPrice(stripePriceId);

    // Flush only invalidates: each entry is recomputed by its next reader, not all at once here
    for (const workspaceIdsBatch of chunk(
      workspaceIds,
      FLUSH_CURRENT_BILLING_SUBSCRIPTION_BATCH_SIZE,
    )) {
      await Promise.all(
        workspaceIdsBatch.map((workspaceId) =>
          this.workspaceCacheService.flush(workspaceId, [
            'currentBillingSubscription',
          ]),
        ),
      );
    }

    this.logger.log(
      `Flushed currentBillingSubscription for ${workspaceIds.length} workspace(s) on price ${stripePriceId}`,
    );
  }

  private async findWorkspaceIdsSubscribedToPrice(
    stripePriceId: string,
  ): Promise<string[]> {
    const rows = await this.billingSubscriptionItemRepository
      .createQueryBuilder('billingSubscriptionItem')
      .innerJoin(
        'billingSubscriptionItem.billingSubscription',
        'billingSubscription',
      )
      .select('billingSubscription.workspaceId', 'workspaceId')
      .distinct(true)
      .where('billingSubscriptionItem.stripePriceId = :stripePriceId', {
        stripePriceId,
      })
      .andWhere('billingSubscription.status != :canceledStatus', {
        canceledStatus: SubscriptionStatus.Canceled,
      })
      .getRawMany<{ workspaceId: string }>();

    return rows.map(({ workspaceId }) => workspaceId);
  }

  private findMatchingPrice(
    item: BillingSubscriptionItemEntity,
  ): BillingPriceEntity {
    const matchingPrice = item.billingProduct.billingPrices.find(
      (price) => price.stripePriceId === item.stripePriceId,
    );

    if (!matchingPrice) {
      throw new BillingException(
        `Cannot find price for product ${item.stripeProductId}`,
        BillingExceptionCode.BILLING_PRICE_NOT_FOUND,
      );
    }

    return matchingPrice;
  }
}
