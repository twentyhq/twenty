/* @license Enterprise */

import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { BillingSubscriptionItemDTO } from 'src/engine/core-modules/billing/dtos/billing-subscription-item.dto';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageQuotaAdmissionService } from 'src/engine/core-modules/usage-limit/services/usage-quota-admission.service';

@MetadataResolver(() => BillingSubscriptionItemDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class BillingSubscriptionItemCapResolver {
  private readonly logger = new Logger(BillingSubscriptionItemCapResolver.name);

  constructor(
    private readonly usageQuotaAdmissionService: UsageQuotaAdmissionService,
    // Field resolver: the workspace comes from the parent item's subscription row
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(BillingSubscriptionEntity)
    private readonly billingSubscriptionRepository: Repository<BillingSubscriptionEntity>,
  ) {}

  // Derived from the live balance: a stored flag drifts as soon as one balance-mutating path misses it
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

    // Rides on currentWorkspace (app boot): a billing read failure must degrade to no banner, never fail the query
    try {
      const billingSubscription =
        await this.billingSubscriptionRepository.findOne({
          where: { id: billingSubscriptionItem.billingSubscriptionId },
        });

      if (!isDefined(billingSubscription)) {
        return false;
      }

      const creditAvailability =
        await this.usageQuotaAdmissionService.getCreditAvailability(
          billingSubscription.workspaceId,
        );

      return (
        !creditAvailability.hasAvailableCredits &&
        creditAvailability.reason === 'NO_CREDITS'
      );
    } catch (error) {
      this.logger.warn(
        `Failed to derive hasReachedCurrentPeriodCap for billing subscription item ${billingSubscriptionItem.id}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return false;
    }
  }
}
