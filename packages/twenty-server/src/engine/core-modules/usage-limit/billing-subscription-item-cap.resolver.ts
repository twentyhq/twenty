/* @license Enterprise */

import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { BillingSubscriptionItemDTO } from 'src/engine/core-modules/billing/dtos/billing-subscription-item.dto';
import { BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UsageQuotaAdmissionService } from 'src/engine/core-modules/usage-limit/services/usage-quota-admission.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';

@MetadataResolver(() => BillingSubscriptionItemDTO)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class BillingSubscriptionItemCapResolver {
  private readonly logger = new Logger(BillingSubscriptionItemCapResolver.name);

  constructor(
    private readonly usageQuotaAdmissionService: UsageQuotaAdmissionService,
  ) {}

  @ResolveField(() => Boolean)
  async hasReachedCurrentPeriodCap(
    @Parent() billingSubscriptionItem: BillingSubscriptionItemEntity,
    @AuthWorkspace({ allowUndefined: true })
    workspace: WorkspaceEntity | undefined,
  ): Promise<boolean> {
    if (!isDefined(workspace)) {
      return false;
    }

    if (
      billingSubscriptionItem.billingProduct?.metadata?.productKey !==
      BillingProductKey.RESOURCE_CREDIT
    ) {
      return false;
    }

    try {
      const creditAvailability =
        await this.usageQuotaAdmissionService.getCreditAvailability(
          workspace.id,
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
