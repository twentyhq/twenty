/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { EnterpriseExceptionFilter } from 'src/engine/core-modules/enterprise/enterprise-exception.filter';
import { EnterpriseLicenseInfoDTO } from 'src/engine/core-modules/enterprise/dtos/enterprise-license-info.dto';
import { EnterpriseSubscriptionStatusDTO } from 'src/engine/core-modules/enterprise/dtos/enterprise-subscription-status.dto';
import {
  EnterpriseException,
  EnterpriseExceptionCode,
} from 'src/engine/core-modules/enterprise/enterprise.exception';
import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ConfigVariableExceptionCode } from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { BillingDisabledGuard } from 'src/engine/guards/billing-disabled.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(EnterpriseExceptionFilter, PreventNestToAutoLogGraphqlErrorsFilter)
export class EnterpriseResolver {
  constructor(
    private readonly enterprisePlanService: EnterprisePlanService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  private async getActiveUserWorkspaceCount(): Promise<number> {
    const count = await this.userWorkspaceRepository.count({
      where: { deletedAt: IsNull() },
    });

    return Math.max(1, count);
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
    const seatCount = await this.getActiveUserWorkspaceCount();

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
    return this.enterprisePlanService.refreshValidityToken();
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

      const seatCount = await this.getActiveUserWorkspaceCount();

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
