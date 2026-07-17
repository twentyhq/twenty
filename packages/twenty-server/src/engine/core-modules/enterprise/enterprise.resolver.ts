/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { EnterpriseLicenseInfoDTO } from 'src/engine/core-modules/enterprise/dtos/enterprise-license-info.dto';
import { EnterpriseSubscriptionStatusDTO } from 'src/engine/core-modules/enterprise/dtos/enterprise-subscription-status.dto';
import { EnterpriseExceptionFilter } from 'src/engine/core-modules/enterprise/enterprise-exception.filter';
import {
  EnterpriseException,
  EnterpriseExceptionCode,
} from 'src/engine/core-modules/enterprise/enterprise.exception';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ConfigVariableExceptionCode } from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { BillingDisabledGuard } from 'src/engine/guards/billing-disabled.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

// Server-binding rejections that should surface as an activation failure with
// their own user-facing message (rather than being silently swallowed).
const SERVER_BINDING_REJECTION_CODES: EnterpriseExceptionCode[] = [
  EnterpriseExceptionCode.ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER,
  EnterpriseExceptionCode.ENTERPRISE_MISSING_SERVER_ID,
  EnterpriseExceptionCode.ENTERPRISE_DEV_REQUIRES_ACTIVE_PRODUCTION,
  EnterpriseExceptionCode.ENTERPRISE_DEV_SLOT_IN_USE,
];

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(EnterpriseExceptionFilter, PreventNestToAutoLogGraphqlErrorsFilter)
export class EnterpriseResolver {
  constructor(private readonly enterprisePlanService: EnterprisePlanService) {}

  // Turn a server-binding rejection from the last refresh into a user-facing
  // error, so activation and manual refresh surface the real reason instead of
  // silently failing.
  private throwIfServerBindingRejected(): void {
    const rejectionCode =
      this.enterprisePlanService.getLastRefreshRejectionCode();

    if (
      isDefined(rejectionCode) &&
      SERVER_BINDING_REJECTION_CODES.includes(
        rejectionCode as EnterpriseExceptionCode,
      )
    ) {
      throw new EnterpriseException(
        `Enterprise key rejected: ${rejectionCode}`,
        rejectionCode as EnterpriseExceptionCode,
      );
    }
  }

  @Query(() => String, { nullable: true })
  @UseGuards(
    WorkspaceAuthGuard,
    BillingDisabledGuard,
    AdminPanelGuard,
    NoPermissionGuard,
  )
  async enterprisePortalSession(
    // for existing subscriptions
    @Args('returnUrlPath', { nullable: true }) returnUrlPath?: string,
  ): Promise<string | null> {
    return this.enterprisePlanService.getPortalUrl(returnUrlPath ?? undefined);
  }

  @Query(() => String, { nullable: true })
  @UseGuards(
    WorkspaceAuthGuard,
    BillingDisabledGuard,
    AdminPanelGuard,
    NoPermissionGuard,
  )
  async enterpriseCheckoutSession(
    // for new subscriptions
    @Args('billingInterval', { nullable: true }) billingInterval?: string,
  ): Promise<string | null> {
    const interval = billingInterval === 'yearly' ? 'yearly' : 'monthly';
    const seatCount = await this.enterprisePlanService.getBillableSeatCount();

    return this.enterprisePlanService.getCheckoutUrl(interval, seatCount);
  }

  @Query(() => EnterpriseSubscriptionStatusDTO, { nullable: true })
  @UseGuards(
    WorkspaceAuthGuard,
    BillingDisabledGuard,
    AdminPanelGuard,
    NoPermissionGuard,
  )
  async enterpriseSubscriptionStatus(): Promise<EnterpriseSubscriptionStatusDTO | null> {
    return this.enterprisePlanService.getSubscriptionStatus();
  }

  @Mutation(() => Boolean)
  @UseGuards(
    WorkspaceAuthGuard,
    BillingDisabledGuard,
    AdminPanelGuard,
    NoPermissionGuard,
  )
  async refreshEnterpriseValidityToken(): Promise<boolean> {
    const refreshed = await this.enterprisePlanService.refreshValidityToken();

    this.throwIfServerBindingRejected();

    return refreshed;
  }

  @Mutation(() => EnterpriseLicenseInfoDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    BillingDisabledGuard,
    AdminPanelGuard,
    NoPermissionGuard,
  )
  async releaseEnterpriseServerBinding(): Promise<EnterpriseLicenseInfoDTO> {
    await this.enterprisePlanService.releaseServerBinding();

    await this.enterprisePlanService.refreshValidityToken();

    const seatCount = await this.enterprisePlanService.getBillableSeatCount();

    await this.enterprisePlanService.reportSeats(seatCount);

    return this.enterprisePlanService.getLicenseInfo();
  }

  @Mutation(() => EnterpriseLicenseInfoDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    BillingDisabledGuard,
    AdminPanelGuard,
    NoPermissionGuard,
  )
  async setEnterpriseKey(
    @Args('enterpriseKey') enterpriseKey: string,
  ): Promise<EnterpriseLicenseInfoDTO> {
    try {
      if (
        !this.enterprisePlanService.isValidEnterpriseKeyFormat(enterpriseKey)
      ) {
        throw new EnterpriseException(
          'Invalid enterprise key',
          EnterpriseExceptionCode.INVALID_ENTERPRISE_KEY,
        );
      }

      await this.enterprisePlanService.setEnterpriseKey(enterpriseKey);

      await this.enterprisePlanService.refreshValidityToken();

      this.throwIfServerBindingRejected();

      const seatCount = await this.enterprisePlanService.getBillableSeatCount();

      await this.enterprisePlanService.reportSeats(seatCount);

      return await this.enterprisePlanService.getLicenseInfo();
    } catch (error) {
      if (error instanceof EnterpriseException) {
        throw error;
      }

      if (
        error instanceof Error &&
        'code' in error &&
        error.code === ConfigVariableExceptionCode.DATABASE_CONFIG_DISABLED
      ) {
        throw new EnterpriseException(
          'IS_CONFIG_VARIABLES_IN_DB_ENABLED is false on the server. Please add ENTERPRISE_KEY to your .env file manually.',
          EnterpriseExceptionCode.CONFIG_VARIABLES_IN_DB_DISABLED,
        );
      }

      return {
        isValid: false,
        licensee: null,
        expiresAt: null,
        subscriptionId: null,
      };
    }
  }
}
