/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';

@MetadataResolver(() => BillingCustomerEntity)
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class BillingCustomerResolver {
  constructor(
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  @ResolveField(() => String, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async stripeCustomerEmail(
    @Parent() billingCustomer: BillingCustomerEntity,
  ): Promise<string | null> {
    const canReadStripeCustomerEmail =
      await this.settingPermissionsService.hasPermissionFlag({
        authContext: workspaceAuthContextStorage.getStore(),
        permissionFlag: PermissionFlagType.BILLING,
      });

    return canReadStripeCustomerEmail
      ? (billingCustomer.stripeCustomerEmail ?? null)
      : null;
  }
}
