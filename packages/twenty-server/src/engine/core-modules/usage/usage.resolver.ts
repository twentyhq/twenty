/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import { UsageAnalyticsDTO } from 'src/engine/core-modules/usage/dtos/usage-analytics.dto';
import { UsageAnalyticsInput } from 'src/engine/core-modules/usage/dtos/inputs/usage-analytics.input';
import {
  type UsageBreakdownItem,
  UsageAnalyticsService,
} from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';

@MetadataResolver()
@UseFilters(PreventNestToAutoLogGraphqlErrorsFilter)
@UsePipes(ResolverValidationPipe)
export class UsageResolver {
  constructor(
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  @Query(() => UsageAnalyticsDTO)
  @UseGuards(
    WorkspaceAuthGuard,
    SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
  )
  async getUsageAnalytics(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input', { nullable: true }) input?: UsageAnalyticsInput,
  ): Promise<UsageAnalyticsDTO> {
    const defaultPeriodEnd = new Date();
    const defaultPeriodStart = new Date();

    defaultPeriodStart.setDate(defaultPeriodStart.getDate() - 30);

    const periodStart = input?.periodStart ?? defaultPeriodStart;
    const periodEnd = input?.periodEnd ?? defaultPeriodEnd;
    const useDollarMode = !this.twentyConfigService.get('IS_BILLING_ENABLED');

    const periodParams = {
      workspaceId: workspace.id,
      periodStart,
      periodEnd,
      operationTypes: input?.operationTypes ?? undefined,
      useDollarMode,
    };

    const [usageByUser, usageByOperationType, usageByModel, timeSeries] =
      await Promise.all([
        this.usageAnalyticsService.getUsageByUser(periodParams),
        this.usageAnalyticsService.getUsageByOperationType({
          ...periodParams,
          userWorkspaceId: input?.userWorkspaceId ?? undefined,
        }),
        this.usageAnalyticsService.getUsageByModel(periodParams),
        this.usageAnalyticsService.getUsageTimeSeries(periodParams),
      ]);

    const resolvedUsageByUser = await this.resolveBreakdownKeys(
      usageByUser,
      (ids) => this.resolveUserNames(ids, workspace.id),
    );

    const result: UsageAnalyticsDTO = {
      usageByUser: resolvedUsageByUser,
      usageByOperationType,
      usageByModel,
      timeSeries,
      periodStart,
      periodEnd,
    };

    if (input?.userWorkspaceId) {
      const userWorkspace = await this.userWorkspaceRepository.findOne({
        where: { id: input.userWorkspaceId, workspaceId: workspace.id },
        select: { id: true },
      });

      if (isDefined(userWorkspace)) {
        const dailyUsage =
          await this.usageAnalyticsService.getUsageByUserTimeSeries({
            ...periodParams,
            userWorkspaceId: input.userWorkspaceId,
          });

        result.userDailyUsage = {
          userWorkspaceId: input.userWorkspaceId,
          dailyUsage,
        };
      }
    }

    return result;
  }

  private async resolveBreakdownKeys(
    items: UsageBreakdownItem[],
    resolveNames: (ids: string[]) => Promise<Map<string, string>>,
  ): Promise<UsageBreakdownItem[]> {
    if (items.length === 0) {
      return items;
    }

    const ids = items.map((item) => item.key);
    const nameMap = await resolveNames(ids);

    return items.map((item) => ({
      ...item,
      label: nameMap.get(item.key),
    }));
  }

  private async resolveUserNames(
    userWorkspaceIds: string[],
    workspaceId: string,
  ): Promise<Map<string, string>> {
    const nameMap = new Map<string, string>();

    if (userWorkspaceIds.length === 0) {
      return nameMap;
    }

    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { id: In(userWorkspaceIds), workspaceId },
      relations: ['user'],
      select: {
        id: true,
        user: { firstName: true, lastName: true, email: true },
      },
    });

    for (const userWorkspace of userWorkspaces) {
      if (!isDefined(userWorkspace.user)) {
        continue;
      }

      const { firstName, lastName, email } = userWorkspace.user;
      const fullName = `${firstName} ${lastName}`.trim();

      nameMap.set(userWorkspace.id, fullName || email);
    }

    return nameMap;
  }
}
