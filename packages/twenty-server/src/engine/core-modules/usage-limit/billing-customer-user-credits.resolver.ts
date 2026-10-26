/* @license Enterprise */

import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';

@MetadataResolver(() => BillingCustomerEntity)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class BillingCustomerUserCreditsResolver {
  private readonly logger = new Logger(BillingCustomerUserCreditsResolver.name);

  constructor(
    private readonly usageLimitQuotaService: UsageLimitQuotaService,
  ) {}

  @ResolveField(() => Boolean)
  async hasUserCredits(
    @Parent() billingCustomer: BillingCustomerEntity,
  ): Promise<boolean> {
    try {
      return await this.usageLimitQuotaService.hasUserCredits(
        billingCustomer.workspaceId,
      );
    } catch (error) {
      this.logger.warn(
        `Failed to derive hasUserCredits for billing customer ${billingCustomer.id}: ${error instanceof Error ? error.message : String(error)}`,
      );

      return false;
    }
  }
}
