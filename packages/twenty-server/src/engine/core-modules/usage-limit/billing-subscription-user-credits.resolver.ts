/* @license Enterprise */

import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';

@MetadataResolver(() => BillingSubscriptionEntity)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class BillingSubscriptionUserCreditsResolver {
  private readonly logger = new Logger(
    BillingSubscriptionUserCreditsResolver.name,
  );

  constructor(
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
  ) {}

  @ResolveField(() => Boolean, { nullable: true })
  async hasUserCredits(
    @Parent() billingSubscription: BillingSubscriptionEntity,
  ): Promise<boolean> {
    try {
      return await this.usageLimitQuotaService.hasUserCredits(
        billingSubscription.workspaceId,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to derive hasUserCredits for billing subscription ${billingSubscription.id}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return false;
    }
  }
}
