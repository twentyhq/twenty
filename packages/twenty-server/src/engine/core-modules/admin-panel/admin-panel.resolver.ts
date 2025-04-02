import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import {
  ConfigVarObject,
  ConfigVarSource,
} from 'src/engine/core-modules/admin-panel/dtos/config-var.dto';
import { EnvironmentVariablesOutput } from 'src/engine/core-modules/admin-panel/dtos/environment-variables.output';
import { ImpersonateInput } from 'src/engine/core-modules/admin-panel/dtos/impersonate.input';
import { ImpersonateOutput } from 'src/engine/core-modules/admin-panel/dtos/impersonate.output';
import { SystemHealth } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { UpdateConfigVarInput } from 'src/engine/core-modules/admin-panel/dtos/update-config-var.input';
import { UpdateWorkspaceFeatureFlagInput } from 'src/engine/core-modules/admin-panel/dtos/update-workspace-feature-flag.input';
import { UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.entity';
import { UserLookupInput } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.input';
import { QueueMetricsTimeRange } from 'src/engine/core-modules/admin-panel/enums/queue-metrics-time-range.enum';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { FeatureFlagException } from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';
import { WorkerHealthIndicator } from 'src/engine/core-modules/health/indicators/worker.health';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { ImpersonateGuard } from 'src/engine/guards/impersonate-guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { AdminPanelHealthServiceData } from './dtos/admin-panel-health-service-data.dto';
import { QueueMetricsData } from './dtos/queue-metrics-data.dto';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class AdminPanelResolver {
  constructor(
    private adminService: AdminPanelService,
    private adminPanelHealthService: AdminPanelHealthService,
    private workerHealthIndicator: WorkerHealthIndicator,
    private featureFlagService: FeatureFlagService,
    private environmentService: EnvironmentService,
  ) {}

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, ImpersonateGuard)
  @Mutation(() => ImpersonateOutput)
  async impersonate(
    @Args() { workspaceId, userId }: ImpersonateInput,
  ): Promise<ImpersonateOutput> {
    return await this.adminService.impersonate(userId, workspaceId);
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, ImpersonateGuard)
  @Mutation(() => UserLookup)
  async userLookupAdminPanel(
    @Args() userLookupInput: UserLookupInput,
  ): Promise<UserLookup> {
    return await this.adminService.userLookup(userLookupInput.userIdentifier);
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, ImpersonateGuard)
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
  @Query(() => EnvironmentVariablesOutput)
  async getEnvironmentVariablesGrouped(): Promise<EnvironmentVariablesOutput> {
    return this.adminService.getEnvironmentVariablesGrouped();
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => SystemHealth)
  async getSystemHealthStatus(): Promise<SystemHealth> {
    return this.adminPanelHealthService.getSystemHealthStatus();
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => AdminPanelHealthServiceData)
  async getIndicatorHealthStatus(
    @Args('indicatorId', {
      type: () => HealthIndicatorId,
    })
    indicatorId: HealthIndicatorId,
  ): Promise<AdminPanelHealthServiceData> {
    return this.adminPanelHealthService.getIndicatorHealthStatus(indicatorId);
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => QueueMetricsData)
  async getQueueMetrics(
    @Args('queueName', { type: () => String })
    queueName: string,
    @Args('timeRange', {
      nullable: true,
      defaultValue: QueueMetricsTimeRange.OneDay,
      type: () => QueueMetricsTimeRange,
    })
    timeRange: QueueMetricsTimeRange = QueueMetricsTimeRange.OneHour,
  ): Promise<QueueMetricsData> {
    return await this.adminPanelHealthService.getQueueMetrics(
      queueName as MessageQueue,
      timeRange,
    );
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => [ConfigVarObject])
  async configVars(): Promise<ConfigVarObject[]> {
    const allVars = this.environmentService.getAll();

    return Object.entries(allVars).map(([key, data]) => {
      return {
        key,
        value: data.value,
        metadata: data.metadata,
        source: data.source as ConfigVarSource,
      };
    });
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Mutation(() => ConfigVarObject)
  async updateConfigVar(
    @Args('input') input: UpdateConfigVarInput,
  ): Promise<ConfigVarObject> {
    const { key, value } = input;

    const metadata = this.environmentService.getMetadata(
      key as keyof EnvironmentVariables,
    );

    if (!metadata) {
      throw new UserInputError(`Configuration variable ${key} does not exist`);
    }

    if (metadata.isEnvOnly) {
      throw new UserInputError(
        `Configuration variable ${key} cannot be stored in the database`,
      );
    }

    let parsedValue = value;

    if (
      typeof value === 'string' &&
      (value.startsWith('[') || value.startsWith('{'))
    ) {
      try {
        parsedValue = JSON.parse(value);
      } catch (e) {
        // If parsing fails, keep the original string value
        // TODO: I don't like this, but for now I don't know how to handle this better
      }
    }

    // Update the value
    await this.environmentService.update(
      key as keyof EnvironmentVariables,
      parsedValue,
    );
    await this.environmentService.refreshConfig(
      key as keyof EnvironmentVariables,
    );

    return {
      key,
      value: parsedValue,
      metadata,
      source: ConfigVarSource.DATABASE,
    };
  }

  @UseGuards(WorkspaceAuthGuard, UserAuthGuard, AdminPanelGuard)
  @Query(() => GraphQLJSON, { name: 'configCacheInfo' })
  async getConfigCacheInfo(): Promise<any> {
    return this.environmentService.getCacheInfo();
  }
}
