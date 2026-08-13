/* @license Enterprise */

import { UseFilters, UsePipes } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { BillingSubscriptionItemDTO } from 'src/engine/core-modules/billing/dtos/billing-subscription-item.dto';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';

@MetadataResolver(() => BillingSubscriptionItemDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class BillingSubscriptionItemResolver {
  constructor(
    private readonly billingUsageService: BillingUsageService,
    // Field resolver: the workspace is discovered from the parent item's
    // subscription row, so it cannot be an input here.
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
  ) {}

  // Derived from the live credit balance instead of read from the stored
  // column: a persisted flag that every balance-mutating path must remember to
  // sync drifts as soon as one path misses, and a workspace stuck with a stale
  // flag gets refused with no banner explaining why.
  @ResolveField(() => Boolean)
  async hasReachedCurrentPeriodCap(
    @Parent() billingSubscriptionItem: BillingSubscriptionItemEntity,
  ): Promise<boolean> {
    if (
      billingSubscriptionItem.billingProduct?.metadata?.productKey !==
      BillingProductKey.RESOURCE_CREDIT
    ) {
      return false;
    }

    const billingSubscription =
      await this.billingSubscriptionRepository.findOne({
        where: { id: billingSubscriptionItem.billingSubscriptionId },
      });

    if (!isDefined(billingSubscription)) {
      return false;
    }

    const creditAvailability =
      await this.billingUsageService.getCreditAvailability(
        billingSubscription.workspaceId,
      );

    return (
      !creditAvailability.hasAvailableCredits &&
      creditAvailability.reason === 'no-credits'
    );
  }
}
