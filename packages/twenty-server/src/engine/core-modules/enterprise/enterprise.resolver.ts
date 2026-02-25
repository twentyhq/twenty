/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { EnterpriseLicenseInfoDTO } from 'src/engine/core-modules/enterprise/dtos/enterprise-license-info.dto';
import { EnterpriseSubscriptionStatusDTO } from 'src/engine/core-modules/enterprise/dtos/enterprise-subscription-status.dto';
import { EnterpriseKeyService } from 'src/engine/core-modules/enterprise/services/enterprise-key.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';
import { workspaceGraphqlApiExceptionHandler } from 'src/engine/core-modules/workspace/utils/workspace-graphql-api-exception-handler.util';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { BillingDisabledGuard } from 'src/engine/guards/billing-disabled.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
export class EnterpriseResolver {
  constructor(
    private readonly enterpriseKeyService: EnterpriseKeyService,
    private readonly twentyConfigService: TwentyConfigService,
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
    @Args('returnUrlPath', { nullable: true }) returnUrlPath?: string,
  ): Promise<string | null> {
    return this.enterpriseKeyService.getPortalUrl(returnUrlPath ?? undefined);
  }

  @Query(() => String, { nullable: true })
  @UseGuards(
    WorkspaceAuthGuard,
    BillingDisabledGuard,
    AdminPanelGuard,
    NoPermissionGuard,
  )
  async enterpriseCheckoutSession(
    @Args('billingInterval', { nullable: true }) billingInterval?: string,
  ): Promise<string | null> {
    const interval = billingInterval === 'yearly' ? 'yearly' : 'monthly';
    const seatCount = await this.getActiveUserWorkspaceCount();

    return this.enterpriseKeyService.getCheckoutUrl(interval, seatCount);
  }

  @Query(() => EnterpriseSubscriptionStatusDTO, { nullable: true })
  @UseGuards(
    WorkspaceAuthGuard,
    BillingDisabledGuard,
    AdminPanelGuard,
    NoPermissionGuard,
  )
  async enterpriseSubscriptionStatus(): Promise<EnterpriseSubscriptionStatusDTO | null> {
    return this.enterpriseKeyService.getSubscriptionStatus();
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
        !this.enterpriseKeyService.isValidEnterpriseKeyFormat(enterpriseKey)
      ) {
        throw new WorkspaceException(
          'Invalid enterprise key',
          WorkspaceExceptionCode.INVALID_ENTERPRISE_KEY,
        );
      }

      await this.twentyConfigService.set('ENTERPRISE_KEY', enterpriseKey);

      await this.enterpriseKeyService.refreshValidityToken();

      const seatCount = await this.getActiveUserWorkspaceCount();

      await this.enterpriseKeyService.reportSeats(seatCount);

      return this.enterpriseKeyService.getLicenseInfo();
    } catch (error) {
      workspaceGraphqlApiExceptionHandler(error);

      return {
        isValid: false,
        licensee: null,
        expiresAt: null,
        subscriptionId: null,
      };
    }
  }
}
