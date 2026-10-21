/* @license Enterprise */

import { UseFilters, UsePipes } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { BillingSubscriptionItemDTO } from 'src/engine/core-modules/billing/dtos/billing-subscription-item.dto';
import { BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';

@MetadataResolver(() => BillingSubscriptionItemDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class BillingSubscriptionItemResolver {
  constructor(
    @InjectRepository(BillingPriceEntity)
    private readonly billingPriceRepository: Repository<BillingPriceEntity>,
  ) {}

  // Not the catalog: superseded prices keep billing existing workspaces and leave the catalog once archived
  @ResolveField(() => Number, { nullable: true })
  async unitAmount(
    @Parent() billingSubscriptionItem: BillingSubscriptionItemEntity,
  ): Promise<number | null> {
    const billingPrice = await this.findItemPrice(billingSubscriptionItem);

    if (!isDefined(billingPrice?.unitAmount)) {
      return null;
    }

    const unitAmount = Number(billingPrice.unitAmount);

    return Number.isFinite(unitAmount) ? unitAmount : null;
  }

  @ResolveField(() => Number, { nullable: true })
  async creditAmount(
    @Parent() billingSubscriptionItem: BillingSubscriptionItemEntity,
  ): Promise<number | null> {
    const billingPrice = await this.findItemPrice(billingSubscriptionItem);

    if (!isDefined(billingPrice?.metadata?.credit_amount)) {
      return null;
    }

    const creditAmount = toDisplayCredits(
      Number(billingPrice.metadata.credit_amount),
    );

    return Number.isFinite(creditAmount) ? creditAmount : null;
  }

  // currentWorkspace preloads product prices so app boot resolves in memory; other callers load no relations and need the query
  private async findItemPrice(
    billingSubscriptionItem: BillingSubscriptionItemEntity,
  ): Promise<BillingPriceEntity | null> {
    const preloadedPrice =
      billingSubscriptionItem.billingProduct?.billingPrices?.find(
        (billingPrice) =>
          billingPrice.stripePriceId === billingSubscriptionItem.stripePriceId,
      );

    return (
      preloadedPrice ??
      (await this.billingPriceRepository.findOne({
        where: { stripePriceId: billingSubscriptionItem.stripePriceId },
      }))
    );
  }
}
