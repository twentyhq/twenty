import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { AdminPanelQueueService } from 'src/engine/core-modules/admin-panel/admin-panel-queue.service';
import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { ConfigVariableDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variable.dto';
import { ConfigVariablesOutput } from 'src/engine/core-modules/admin-panel/dtos/config-variables.output';
import { DeleteJobsResponseDTO } from 'src/engine/core-modules/admin-panel/dtos/delete-jobs-response.dto';
import { QueueJobsResponseDTO } from 'src/engine/core-modules/admin-panel/dtos/queue-jobs-response.dto';
import { RetryJobsResponseDTO } from 'src/engine/core-modules/admin-panel/dtos/retry-jobs-response.dto';
import { SystemHealthDTO } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { UpdateWorkspaceFeatureFlagInput } from 'src/engine/core-modules/admin-panel/dtos/update-workspace-feature-flag.input';
import { UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.entity';
import { UserLookupInput } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.input';
import { VersionInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/version-info.dto';
import { JobStateEnum } from 'src/engine/core-modules/admin-panel/enums/job-state.enum';
import { QueueMetricsTimeRange } from 'src/engine/core-modules/admin-panel/enums/queue-metrics-time-range.enum';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FeatureFlagException } from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigVariableGraphqlApiExceptionFilter } from 'src/engine/core-modules/twenty-config/filters/config-variable-graphql-api-exception.filter';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { ServerLevelImpersonateGuard } from 'src/engine/guards/server-level-impersonate.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { AdminPanelHealthServiceDataDTO } from './dtos/admin-panel-health-service-data.dto';
import { QueueMetricsDataDTO } from './dtos/queue-metrics-data.dto';

@UsePipes(ResolverValidationPipe)
@Resolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  ConfigVariableGraphqlApiExceptionFilter,
)
export class AdminPanelResolver {
  constructor(
    private adminService: AdminPanelService,
    private adminPanelHealthService: AdminPanelHealthService,
    private adminPanelQueueService: AdminPanelQueueService,
    private featureFlagService: FeatureFlagService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, ServerLevelImpersonateGuard)
  @Mutation(() => UserLookup)
  async userLookupAdminPanel(
    @Args() userLookupInput: UserLookupInput,
  ): Promise<UserLookup> {
    return await this.adminService.userLookup(userLookupInput.userIdentifier);
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  @Mutation(() => Boolean)
  async updateWorkspaceFeatureFlag(
    @Args() updateFlagInput: UpdateWorkspaceFeatureFlagInput,
  ): Promise<boolean> {
    try {
      await this.featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId: updateFlagInput.workspaceId,
        featureFlag: updateFlagInput.featureFlag,
        value: updateFlagInput.value,
      });

      return true;
    } catch (error) {
      if (error instanceof FeatureFlagException) {
        throw new UserInputError(error.message);
      }

      throw error;
    }
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => ConfigVariablesOutput)
  async getConfigVariablesGrouped(): Promise<ConfigVariablesOutput> {
    return this.adminService.getConfigVariablesGrouped();
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => SystemHealthDTO)
  async getSystemHealthStatus(): Promise<SystemHealthDTO> {
    return this.adminPanelHealthService.getSystemHealthStatus();
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => AdminPanelHealthServiceDataDTO)
  async getIndicatorHealthStatus(
    @Args('indicatorId', {
      type: () => HealthIndicatorId,
    })
    indicatorId: HealthIndicatorId,
  ): Promise<AdminPanelHealthServiceDataDTO> {
    return this.adminPanelHealthService.getIndicatorHealthStatus(indicatorId);
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => QueueMetricsDataDTO)
  async getQueueMetrics(
    @Args('queueName', { type: () => String })
    queueName: string,
    @Args('timeRange', {
      nullable: true,
      defaultValue: QueueMetricsTimeRange.OneHour,
      type: () => QueueMetricsTimeRange,
    })
    timeRange: QueueMetricsTimeRange = QueueMetricsTimeRange.OneHour,
  ): Promise<QueueMetricsDataDTO> {
    return await this.adminPanelHealthService.getQueueMetrics(
      queueName as MessageQueue,
      timeRange,
    );
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => VersionInfoDTO)
  async versionInfo(): Promise<VersionInfoDTO> {
    return this.adminService.getVersionInfo();
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => ConfigVariableDTO)
  async getDatabaseConfigVariable(
    @Args('key', { type: () => String }) key: keyof ConfigVariables,
  ): Promise<ConfigVariableDTO> {
    this.twentyConfigService.validateConfigVariableExists(key as string);

    return this.adminService.getConfigVariable(key);
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Mutation(() => Boolean)
  async createDatabaseConfigVariable(
    @Args('key', { type: () => String }) key: keyof ConfigVariables,
    @Args('value', { type: () => GraphQLJSON })
    value: ConfigVariables[keyof ConfigVariables],
  ): Promise<boolean> {
    await this.twentyConfigService.set(key, value);

    return true;
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Mutation(() => Boolean)
  async updateDatabaseConfigVariable(
    @Args('key', { type: () => String }) key: keyof ConfigVariables,
    @Args('value', { type: () => GraphQLJSON })
    value: ConfigVariables[keyof ConfigVariables],
  ): Promise<boolean> {
    await this.twentyConfigService.update(key, value);

    return true;
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Mutation(() => Boolean)
  async deleteDatabaseConfigVariable(
    @Args('key', { type: () => String }) key: keyof ConfigVariables,
  ): Promise<boolean> {
    await this.twentyConfigService.delete(key);

    return true;
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => QueueJobsResponseDTO)
  async getQueueJobs(
    @Args('queueName', { type: () => String })
    queueName: string,
    @Args('state', { type: () => JobStateEnum })
    state: JobStateEnum,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 })
    limit?: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 })
    offset?: number,
  ): Promise<QueueJobsResponseDTO> {
    return await this.adminPanelQueueService.getQueueJobs(
      queueName as MessageQueue,
      state,
      limit,
      offset,
    );
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Mutation(() => RetryJobsResponseDTO)
  async retryJobs(
    @Args('queueName', { type: () => String })
    queueName: string,
    @Args('jobIds', { type: () => [String] })
    jobIds: string[],
  ): Promise<RetryJobsResponseDTO> {
    return await this.adminPanelQueueService.retryJobs(
      queueName as MessageQueue,
      jobIds,
    );
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Mutation(() => DeleteJobsResponseDTO)
  async deleteJobs(
    @Args('queueName', { type: () => String })
    queueName: string,
    @Args('jobIds', { type: () => [String] })
    jobIds: string[],
  ): Promise<DeleteJobsResponseDTO> {
    return await this.adminPanelQueueService.deleteJobs(
      queueName as MessageQueue,
      jobIds,
    );
  }
}
