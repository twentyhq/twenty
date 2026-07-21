import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Int, Mutation, Query } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import GraphQLJSON from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { InstanceAndAllWorkspacesUpgradeStatusDTO } from 'src/engine/core-modules/upgrade/dtos/instance-and-all-workspaces-upgrade-status.dto';
import { WorkspaceUpgradeStatusDTO } from 'src/engine/core-modules/upgrade/dtos/workspace-upgrade-status.dto';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { AdminPanelQueueService } from 'src/engine/core-modules/admin-panel/admin-panel-queue.service';
import { AdminChatThreadMessagesDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-chat-thread-messages.dto';
import { AdminPanelRecentUserDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-recent-user.dto';
import { AdminPanelTopWorkspaceDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-top-workspace.dto';
import { AdminPanelWorkspaceBillingDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-workspace-billing.dto';
import { AdminWorkspaceChatThreadDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-workspace-chat-thread.dto';
import { ConfigVariableDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variable.dto';
import { ConfigVariablesDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variables.dto';
import { DeleteJobsResponseDTO } from 'src/engine/core-modules/admin-panel/dtos/delete-jobs-response.dto';
import { QueueJobsResponseDTO } from 'src/engine/core-modules/admin-panel/dtos/queue-jobs-response.dto';
import { RetryJobsResponseDTO } from 'src/engine/core-modules/admin-panel/dtos/retry-jobs-response.dto';
import { RevokeSigningKeyInput } from 'src/engine/core-modules/admin-panel/dtos/revoke-signing-key.input';
import { ServerAdminDTO } from 'src/engine/core-modules/admin-panel/dtos/server-admin.dto';
import { SigningKeyDTO } from 'src/engine/core-modules/admin-panel/dtos/signing-key.dto';
import { SigningKeysAdminPanelDTO } from 'src/engine/core-modules/admin-panel/dtos/signing-keys-admin-panel.dto';
import { SystemHealthDTO } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { UpdateServerAdminAccessInput } from 'src/engine/core-modules/admin-panel/dtos/update-server-admin-access.input';
import { UpdateWorkspaceFeatureFlagInput } from 'src/engine/core-modules/admin-panel/dtos/update-workspace-feature-flag.input';
import { UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
import { UserLookupInput } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.input';
import { VersionInfoDTO } from 'src/engine/core-modules/admin-panel/dtos/version-info.dto';
import { HealthIndicatorId } from 'src/engine/core-modules/admin-panel/enums/health-indicator-id.enum';
import { JobStateEnum } from 'src/engine/core-modules/admin-panel/enums/job-state.enum';
import { QueueMetricsTimeRange } from 'src/engine/core-modules/admin-panel/enums/queue-metrics-time-range.enum';
import { MaintenanceModeService } from 'src/engine/core-modules/admin-panel/maintenance-mode.service';
import { AdminPanelBillingService } from 'src/engine/core-modules/admin-panel/services/admin-panel-billing.service';
import { AdminPanelChatService } from 'src/engine/core-modules/admin-panel/services/admin-panel-chat.service';
import { AdminPanelConfigService } from 'src/engine/core-modules/admin-panel/services/admin-panel-config.service';
import { AdminPanelSigningKeyService } from 'src/engine/core-modules/admin-panel/services/admin-panel-signing-key.service';
import { AdminPanelServerAdminService } from 'src/engine/core-modules/admin-panel/services/admin-panel-server-admin.service';
import { AdminPanelStatisticsService } from 'src/engine/core-modules/admin-panel/services/admin-panel-statistics.service';
import { AdminPanelUserLookupService } from 'src/engine/core-modules/admin-panel/services/admin-panel-user-lookup.service';
import { AdminPanelVersionService } from 'src/engine/core-modules/admin-panel/services/admin-panel-version.service';
import { ApplicationRegistrationVariableDTO } from 'src/engine/core-modules/application/application-registration-variable/dtos/application-registration-variable.dto';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { UpdateApplicationRegistrationVariableInput } from 'src/engine/core-modules/application/application-registration-variable/dtos/update-application-registration-variable.input';
import { ApplicationRegistrationClaimService } from 'src/engine/core-modules/application/application-registration/application-registration-claim.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { AdminApplicationRegistrationClaimDTO } from 'src/engine/core-modules/application/application-registration/dtos/admin-application-registration-claim.dto';
import { ApplicationRegistrationInstalledWorkspacesDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-installed-workspaces.dto';
import { ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { FindApplicationRegistrationInstalledWorkspacesInput } from 'src/engine/core-modules/application/application-registration/dtos/find-application-registration-installed-workspaces.input';
import { PaginatedApplicationRegistrationsDTO } from 'src/engine/core-modules/application/application-registration/dtos/paginated-application-registrations.dto';
import { UpdateApplicationRegistrationInput } from 'src/engine/core-modules/application/application-registration/dtos/update-application-registration.input';
import {
  BACKFILL_APPLICATION_INSTALLATION_JOB_NAME,
  type BackfillApplicationInstallationJobData,
} from 'src/engine/core-modules/application/jobs/backfill-application-installation.job-constants';
import {
  UPGRADE_APPLICATIONS_JOB_NAME,
  type UpgradeApplicationsJobData,
} from 'src/engine/core-modules/application/jobs/upgrade-applications.job-constants';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AdminAiModelsDTO } from 'src/engine/core-modules/client-config/client-config.entity';
import { FeatureFlagException } from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { MarketplaceCatalogSyncCronJob } from 'src/engine/core-modules/application/application-marketplace/crons/marketplace-catalog-sync.cron.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigVariableGraphqlApiExceptionFilter } from 'src/engine/core-modules/twenty-config/filters/config-variable-graphql-api-exception.filter';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwoFactorAuthenticationExceptionFilter } from 'src/engine/core-modules/two-factor-authentication/two-factor-authentication-exception.filter';
import { UsageBreakdownItemDTO } from 'src/engine/core-modules/usage/dtos/usage-breakdown-item.dto';
import { UsageAnalyticsService } from 'src/engine/core-modules/usage/services/usage-analytics.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { AdminPanelOrImpersonateGuard } from 'src/engine/guards/admin-panel-or-impersonate.guard';
import { NoImpersonationGuard } from 'src/engine/guards/no-impersonation.guard';
import { ServerLevelImpersonateGuard } from 'src/engine/guards/server-level-impersonate.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { MODEL_FAMILY_LABELS } from 'src/engine/metadata-modules/ai/ai-models/constants/model-family-labels.const';
import { AiModelPreferencesService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-preferences.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { DefaultAiCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/default-ai-catalog.service';
import { ModelsDevCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/models-dev-catalog.service';
import { AiModelRole } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-role.enum';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { extractConfigVariableName } from 'src/engine/metadata-modules/ai/ai-models/utils/extract-config-variable-name.util';

import { AdminPanelHealthServiceDataDTO } from './dtos/admin-panel-health-service-data.dto';
import { MaintenanceModeDTO } from './dtos/maintenance-mode.dto';
import { ModelsDevModelSuggestionDTO } from './dtos/models-dev-model-suggestion.dto';
import { ModelsDevProviderSuggestionDTO } from './dtos/models-dev-provider-suggestion.dto';
import { QueueMetricsDataDTO } from './dtos/queue-metrics-data.dto';
import { SetMaintenanceModeInput } from './dtos/set-maintenance-mode.input';

@UsePipes(ResolverValidationPipe)
@AdminResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  TwoFactorAuthenticationExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  ConfigVariableGraphqlApiExceptionFilter,
)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SECURITY),
)
export class AdminPanelResolver {
  constructor(
    private readonly adminUserLookupService: AdminPanelUserLookupService,
    private readonly adminServerAdminService: AdminPanelServerAdminService,
    private readonly adminStatisticsService: AdminPanelStatisticsService,
    private readonly adminBillingService: AdminPanelBillingService,
    private readonly adminChatService: AdminPanelChatService,
    private readonly adminConfigService: AdminPanelConfigService,
    private readonly adminVersionService: AdminPanelVersionService,
    private readonly adminPanelHealthService: AdminPanelHealthService,
    private readonly adminPanelSigningKeyService: AdminPanelSigningKeyService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly applicationRegistrationClaimService: ApplicationRegistrationClaimService,
    private readonly applicationRegistrationVariableService: ApplicationRegistrationVariableService,
    private adminPanelQueueService: AdminPanelQueueService,
    private featureFlagService: FeatureFlagService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiModelPreferencesService: AiModelPreferencesService,
    private readonly defaultAiCatalogService: DefaultAiCatalogService,
    private readonly modelsDevCatalogService: ModelsDevCatalogService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly maintenanceModeService: MaintenanceModeService,
    private readonly upgradeStatusService: UpgradeStatusService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly cronQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly workspaceQueueService: MessageQueueService,
  ) {}

  @UseGuards(AdminPanelOrImpersonateGuard)
  @Query(() => UserLookup)
  async userLookupAdminPanel(
    @Args() userLookupInput: UserLookupInput,
  ): Promise<UserLookup> {
    return await this.adminUserLookupService.userLookup(
      userLookupInput.userIdentifier,
    );
  }

  @UseGuards(AdminPanelOrImpersonateGuard)
  @Query(() => [AdminPanelRecentUserDTO])
  async adminPanelRecentUsers(
    @Args('searchTerm', {
      type: () => String,
      nullable: true,
      defaultValue: '',
    })
    searchTerm: string,
  ): Promise<AdminPanelRecentUserDTO[]> {
    return this.adminStatisticsService.getRecentUsers(searchTerm);
  }

  @UseGuards(ServerLevelImpersonateGuard)
  @Query(() => [AdminPanelTopWorkspaceDTO])
  async adminPanelTopWorkspaces(
    @Args('searchTerm', {
      type: () => String,
      nullable: true,
      defaultValue: '',
    })
    searchTerm: string,
  ): Promise<AdminPanelTopWorkspaceDTO[]> {
    return this.adminStatisticsService.getTopWorkspaces(searchTerm);
  }

  @UseGuards(AdminPanelGuard, NoImpersonationGuard)
  @Query(() => [ServerAdminDTO])
  async getServerAdmins(): Promise<ServerAdminDTO[]> {
    return this.adminServerAdminService.getServerAdmins();
  }

  @UseGuards(AdminPanelGuard, NoImpersonationGuard)
  @Mutation(() => ServerAdminDTO)
  async updateServerAdminAccess(
    @Args() input: UpdateServerAdminAccessInput,
    @AuthUser() actor: AuthContextUser,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ServerAdminDTO> {
    return this.adminServerAdminService.updateServerAdminAccess({
      actor,
      actorWorkspaceId: workspace.id,
      targetUserId: input.userId,
      canAccessFullAdminPanel: input.canAccessFullAdminPanel,
      canImpersonate: input.canImpersonate,
      otp: input.otp,
    });
  }

  @UseGuards(AdminPanelGuard)
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

  @UseGuards(AdminPanelGuard)
  @Query(() => ConfigVariablesDTO)
  async getConfigVariablesGrouped(): Promise<ConfigVariablesDTO> {
    return this.adminConfigService.getConfigVariablesGrouped();
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => SystemHealthDTO)
  async getSystemHealthStatus(): Promise<SystemHealthDTO> {
    return this.adminPanelHealthService.getSystemHealthStatus();
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => AdminPanelHealthServiceDataDTO)
  async getIndicatorHealthStatus(
    @Args('indicatorId', {
      type: () => HealthIndicatorId,
    })
    indicatorId: HealthIndicatorId,
  ): Promise<AdminPanelHealthServiceDataDTO> {
    return this.adminPanelHealthService.getIndicatorHealthStatus(indicatorId);
  }

  @UseGuards(AdminPanelGuard)
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

  @UseGuards(AdminPanelGuard)
  @Query(() => VersionInfoDTO)
  async versionInfo(): Promise<VersionInfoDTO> {
    return this.adminVersionService.getVersionInfo();
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => AdminAiModelsDTO)
  async getAdminAiModels(): Promise<AdminAiModelsDTO> {
    const resolvedProviders =
      this.aiModelRegistryService.getResolvedProvidersForAdmin();

    const models = this.aiModelRegistryService
      .getAllModelsWithStatus()
      .map(
        ({
          modelConfig,
          isAvailable,
          isAdminEnabled,
          isRecommended,
          providerName,
          name,
        }) => ({
          modelId: modelConfig.modelId,
          label: modelConfig.label,
          modelFamily: modelConfig.modelFamily,
          modelFamilyLabel: modelConfig.modelFamily
            ? MODEL_FAMILY_LABELS[modelConfig.modelFamily]
            : undefined,
          sdkPackage: modelConfig.sdkPackage,
          isAvailable,
          isAdminEnabled,
          isDeprecated: modelConfig.isDeprecated ?? false,
          isRecommended,
          contextWindowTokens: modelConfig.contextWindowTokens,
          maxOutputTokens: modelConfig.maxOutputTokens,
          inputCostPerMillionTokens: modelConfig.inputCostPerMillionTokens,
          outputCostPerMillionTokens: modelConfig.outputCostPerMillionTokens,
          providerName,
          providerLabel: providerName
            ? (resolvedProviders[providerName]?.label ?? providerName)
            : undefined,
          name,
          dataResidency: modelConfig.dataResidency,
        }),
      );

    const prefs = this.aiModelPreferencesService.getPreferences();

    return {
      models,
      defaultSmartModelId: prefs.defaultSmartModels?.[0],
      defaultFastModelId: prefs.defaultFastModels?.[0],
    };
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async setAdminAiModelEnabled(
    @Args('modelId', { type: () => String }) modelId: string,
    @Args('enabled', { type: () => Boolean }) enabled: boolean,
  ): Promise<boolean> {
    await this.aiModelRegistryService.setModelAdminEnabled(modelId, enabled);

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async setAdminAiModelsEnabled(
    @Args('modelIds', { type: () => [String] }) modelIds: string[],
    @Args('enabled', { type: () => Boolean }) enabled: boolean,
  ): Promise<boolean> {
    await this.aiModelRegistryService.setModelsAdminEnabled(modelIds, enabled);

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async setAdminAiModelRecommended(
    @Args('modelId', { type: () => String }) modelId: string,
    @Args('recommended', { type: () => Boolean }) recommended: boolean,
  ): Promise<boolean> {
    await this.aiModelRegistryService.setModelRecommended(modelId, recommended);

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async setAdminAiModelsRecommended(
    @Args('modelIds', { type: () => [String] }) modelIds: string[],
    @Args('recommended', { type: () => Boolean }) recommended: boolean,
  ): Promise<boolean> {
    await this.aiModelRegistryService.setModelsRecommended(
      modelIds,
      recommended,
    );

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async setAdminDefaultAiModel(
    @Args('role', { type: () => AiModelRole }) role: AiModelRole,
    @Args('modelId', { type: () => String }) modelId: string,
  ): Promise<boolean> {
    await this.aiModelRegistryService.setDefaultModel(role, modelId);

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => ConfigVariableDTO)
  async getDatabaseConfigVariable(
    @Args('key', { type: () => String }) key: keyof ConfigVariables,
  ): Promise<ConfigVariableDTO> {
    this.twentyConfigService.validateConfigVariableExists(key as string);

    return this.adminConfigService.getConfigVariable(key);
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async createDatabaseConfigVariable(
    @Args('key', { type: () => String }) key: keyof ConfigVariables,
    @Args('value', { type: () => GraphQLJSON })
    value: ConfigVariables[keyof ConfigVariables],
  ): Promise<boolean> {
    await this.twentyConfigService.set(key, value);

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async updateDatabaseConfigVariable(
    @Args('key', { type: () => String }) key: keyof ConfigVariables,
    @Args('value', { type: () => GraphQLJSON })
    value: ConfigVariables[keyof ConfigVariables],
  ): Promise<boolean> {
    await this.twentyConfigService.update(key, value);

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async deleteDatabaseConfigVariable(
    @Args('key', { type: () => String }) key: keyof ConfigVariables,
  ): Promise<boolean> {
    await this.twentyConfigService.delete(key);

    return true;
  }

  @UseGuards(AdminPanelGuard)
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

  @UseGuards(AdminPanelGuard)
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

  @UseGuards(AdminPanelGuard)
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

  @UseGuards(AdminPanelGuard)
  @Query(() => PaginatedApplicationRegistrationsDTO)
  async findAllApplicationRegistrations(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 25 })
    limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 })
    offset: number,
    @Args('searchTerm', { type: () => String, nullable: true })
    searchTerm?: string,
    @Args('isPreInstalledOnly', { type: () => Boolean, nullable: true })
    isPreInstalledOnly?: boolean,
  ): Promise<PaginatedApplicationRegistrationsDTO> {
    return this.applicationRegistrationService.findAll({
      limit,
      offset,
      searchTerm,
      isPreInstalledOnly,
    });
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async syncMarketplaceCatalog(): Promise<boolean> {
    await this.cronQueueService.add(
      MarketplaceCatalogSyncCronJob.name,
      {},
      { id: 'marketplace-catalog-sync' }, // Avoids triggering multiple pending jobs
    );

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => [AdminApplicationRegistrationClaimDTO])
  async findAdminApplicationRegistrationClaims(
    @Args('applicationRegistrationId') applicationRegistrationId: string,
  ): Promise<AdminApplicationRegistrationClaimDTO[]> {
    return this.applicationRegistrationClaimService.findClaimsForRegistration(
      applicationRegistrationId,
    );
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => ApplicationRegistrationEntity)
  async updateAdminApplicationRegistration(
    @Args('input') input: UpdateApplicationRegistrationInput,
  ): Promise<ApplicationRegistrationEntity> {
    return this.applicationRegistrationService.updateGlobal(input);
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async backfillApplicationInstallation(
    @Args('applicationRegistrationId') applicationRegistrationId: string,
  ): Promise<boolean> {
    const registration =
      await this.applicationRegistrationService.findOneByIdGlobal(
        applicationRegistrationId,
      );

    if (!registration.isPreInstalled) {
      throw new UserInputError(
        'Only pre-installed apps can be backfilled. Enable pre-install first.',
      );
    }

    await this.workspaceQueueService.add<BackfillApplicationInstallationJobData>(
      BACKFILL_APPLICATION_INSTALLATION_JOB_NAME,
      { applicationRegistrationId },
      {
        id: `${BACKFILL_APPLICATION_INSTALLATION_JOB_NAME}-${applicationRegistrationId}`,
      }, // Avoids triggering multiple pending jobs for the same app
    );

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async upgradeRegistrationApplications(
    @Args('applicationRegistrationId') applicationRegistrationId: string,
    @Args('batchSize', { type: () => Int, nullable: true })
    batchSize?: number,
  ): Promise<boolean> {
    await this.applicationRegistrationService.findOneByIdGlobal(
      applicationRegistrationId,
    );

    await this.workspaceQueueService.add<UpgradeApplicationsJobData>(
      UPGRADE_APPLICATIONS_JOB_NAME,
      {
        applicationRegistrationId,
        onlyAutoUpgrade: false,
        ...(isDefined(batchSize) ? { batchSize } : {}),
      },
      {
        id: `${UPGRADE_APPLICATIONS_JOB_NAME}-${applicationRegistrationId}`,
      }, // Avoids triggering multiple pending jobs for the same app
    );

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => GraphQLJSON)
  async getAiProviders(): Promise<Record<string, unknown>> {
    const providers =
      this.aiModelRegistryService.getResolvedProvidersForAdmin();
    const catalogNames = this.aiModelRegistryService.getCatalogProviderNames();
    const rawCatalog = this.defaultAiCatalogService.getDefaultAiCatalog();
    const masked: Record<string, Record<string, unknown>> = {};

    for (const [key, config] of Object.entries(providers)) {
      const isCatalog = catalogNames.has(key);
      const rawConfig = isCatalog ? rawCatalog[key] : undefined;
      const apiKeyConfigVariable = rawConfig
        ? extractConfigVariableName(rawConfig.apiKey)
        : undefined;

      masked[key] = {
        npm: config.npm,
        label: config.label ?? key,
        source: isCatalog ? 'catalog' : 'custom',
        ...(config.authType && { authType: config.authType }),
        ...(config.name && { name: config.name }),
        ...(config.baseUrl && { baseUrl: config.baseUrl }),
        ...(config.region && { region: config.region }),
        ...(config.dataResidency && { dataResidency: config.dataResidency }),
        ...(config.apiKey && {
          apiKey: `${config.apiKey.substring(0, 8)}...`,
        }),
        ...(apiKeyConfigVariable && { apiKeyConfigVariable }),
        hasAccessKey: !!(config.accessKeyId && config.secretAccessKey),
      };
    }

    return masked;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async addAiProvider(
    @Args('providerName', { type: () => String }) providerName: string,
    @Args('providerConfig', { type: () => GraphQLJSON })
    providerConfig: AiProviderConfig,
  ): Promise<boolean> {
    if (!/^[a-zA-Z0-9_-]+$/.test(providerName)) {
      throw new UserInputError('Invalid provider name');
    }

    const customProviders = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };

    customProviders[providerName] = providerConfig;
    await this.twentyConfigService.set('AI_PROVIDERS', customProviders);

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async removeAiProvider(
    @Args('providerName', { type: () => String })
    providerName: string,
  ): Promise<boolean> {
    const customProviders = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };

    delete customProviders[providerName];
    await this.twentyConfigService.set('AI_PROVIDERS', customProviders);

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => [ModelsDevProviderSuggestionDTO])
  async getModelsDevProviders(): Promise<ModelsDevProviderSuggestionDTO[]> {
    return this.modelsDevCatalogService.getProviderSuggestions();
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => [ModelsDevModelSuggestionDTO])
  async getModelsDevSuggestions(
    @Args('providerType', { type: () => String }) providerType: string,
  ): Promise<ModelsDevModelSuggestionDTO[]> {
    return this.modelsDevCatalogService.getModelSuggestions(providerType);
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async addModelToProvider(
    @Args('providerName', { type: () => String }) providerName: string,
    @Args('modelConfig', { type: () => GraphQLJSON })
    modelConfig: AiProviderModelConfig,
  ): Promise<boolean> {
    const customProviders = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };

    const existing = customProviders[providerName];

    if (!existing) {
      throw new UserInputError(
        `Provider "${providerName}" not found in custom providers`,
      );
    }

    const existingModels = existing.models ?? [];
    const alreadyExists = existingModels.some(
      (model: AiProviderModelConfig) => model.name === modelConfig.name,
    );

    if (alreadyExists) {
      throw new UserInputError(
        `Model "${modelConfig.name}" already exists on provider "${providerName}"`,
      );
    }

    customProviders[providerName] = {
      ...existing,
      models: [...existingModels, { ...modelConfig, source: 'manual' }],
    };

    await this.twentyConfigService.set('AI_PROVIDERS', customProviders);

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async removeModelFromProvider(
    @Args('providerName', { type: () => String }) providerName: string,
    @Args('modelName', { type: () => String }) modelName: string,
  ): Promise<boolean> {
    const customProviders = {
      ...this.twentyConfigService.get('AI_PROVIDERS'),
    };

    const existing = customProviders[providerName];

    if (!existing) {
      throw new UserInputError(
        `Provider "${providerName}" not found in custom providers`,
      );
    }

    const existingModels = existing.models ?? [];

    customProviders[providerName] = {
      ...existing,
      models: existingModels.filter(
        (model: AiProviderModelConfig) => model.name !== modelName,
      ),
    };

    await this.twentyConfigService.set('AI_PROVIDERS', customProviders);

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => [UsageBreakdownItemDTO])
  async getAdminAiUsageByWorkspace(
    @Args('periodStart', { type: () => Date, nullable: true })
    periodStart?: Date,
    @Args('periodEnd', { type: () => Date, nullable: true })
    periodEnd?: Date,
  ): Promise<UsageBreakdownItemDTO[]> {
    const defaultEnd = new Date();
    const defaultStart = new Date();

    defaultStart.setDate(defaultStart.getDate() - 30);

    const useDollarMode = !this.twentyConfigService.get('IS_BILLING_ENABLED');

    const items = await this.usageAnalyticsService.getAdminAiUsageByWorkspace({
      periodStart: periodStart ?? defaultStart,
      periodEnd: periodEnd ?? defaultEnd,
      useDollarMode,
    });

    if (items.length === 0) {
      return items;
    }

    const workspaceIds = items.map((item) => item.key);
    const workspaces = await this.workspaceRepository.find({
      where: { id: In(workspaceIds) },
      select: { id: true, displayName: true },
    });

    const nameMap = new Map(
      workspaces
        .filter((workspace) => isDefined(workspace.displayName))
        .map((workspace) => [workspace.id, workspace.displayName!]),
    );

    return items.map((item) => ({
      ...item,
      label: nameMap.get(item.key),
    }));
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => MaintenanceModeDTO, { nullable: true })
  async getMaintenanceMode(): Promise<MaintenanceModeDTO | null> {
    const value = await this.maintenanceModeService.getMaintenanceMode();

    if (!isDefined(value)) {
      return null;
    }

    return {
      startAt: new Date(value.startAt),
      endAt: new Date(value.endAt),
      link: value.link,
    };
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async setMaintenanceMode(
    @Args() { startAt, endAt, link }: SetMaintenanceModeInput,
  ): Promise<boolean> {
    await this.maintenanceModeService.setMaintenanceMode({
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      link,
    });

    return true;
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async clearMaintenanceMode(): Promise<boolean> {
    await this.maintenanceModeService.clearMaintenanceMode();

    return true;
  }

  @UseGuards(ServerLevelImpersonateGuard)
  @Query(() => UserLookup)
  async workspaceLookupAdminPanel(
    @Args('workspaceId', { type: () => UUIDScalarType }) workspaceId: string,
  ): Promise<UserLookup> {
    return this.adminUserLookupService.workspaceLookup(workspaceId);
  }

  @UseGuards(ServerLevelImpersonateGuard)
  @Query(() => AdminPanelWorkspaceBillingDTO, { nullable: true })
  async workspaceBillingAdminPanel(
    @Args('workspaceId', { type: () => UUIDScalarType }) workspaceId: string,
  ): Promise<AdminPanelWorkspaceBillingDTO | null> {
    return this.adminBillingService.getWorkspaceBilling(workspaceId);
  }

  @UseGuards(ServerLevelImpersonateGuard)
  @Query(() => [AdminWorkspaceChatThreadDTO])
  async getAdminWorkspaceChatThreads(
    @Args('workspaceId', { type: () => UUIDScalarType }) workspaceId: string,
  ): Promise<AdminWorkspaceChatThreadDTO[]> {
    return this.adminChatService.getWorkspaceChatThreads(workspaceId);
  }

  @UseGuards(ServerLevelImpersonateGuard)
  @Query(() => AdminChatThreadMessagesDTO)
  async getAdminChatThreadMessages(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
  ): Promise<AdminChatThreadMessagesDTO> {
    return this.adminChatService.getChatThreadMessages(threadId);
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => ApplicationRegistrationEntity)
  async findOneAdminApplicationRegistration(
    @Args('id') id: string,
  ): Promise<ApplicationRegistrationEntity> {
    return this.applicationRegistrationService.findOneByIdGlobal(id);
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => [ApplicationRegistrationVariableDTO])
  async findAdminApplicationRegistrationVariables(
    @Args('applicationRegistrationId') applicationRegistrationId: string,
  ): Promise<ApplicationRegistrationVariableDTO[]> {
    return this.applicationRegistrationVariableService.findVariablesWithObfuscatedValuesGlobal(
      applicationRegistrationId,
    );
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => ApplicationRegistrationStatsDTO)
  async findAdminApplicationRegistrationStats(
    @Args('id') id: string,
  ): Promise<ApplicationRegistrationStatsDTO> {
    return this.applicationRegistrationService.getStatsGlobal(id);
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => ApplicationRegistrationInstalledWorkspacesDTO)
  async findAdminApplicationRegistrationInstalledWorkspaces(
    @Args('input')
    {
      id,
      limit,
      offset,
      searchTerm,
    }: FindApplicationRegistrationInstalledWorkspacesInput,
  ): Promise<ApplicationRegistrationInstalledWorkspacesDTO> {
    return this.applicationRegistrationService.getInstalledWorkspacesGlobal(
      id,
      limit,
      offset,
      searchTerm,
    );
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => ApplicationRegistrationVariableDTO)
  async updateAdminApplicationRegistrationVariable(
    @Args('input') input: UpdateApplicationRegistrationVariableInput,
  ): Promise<ApplicationRegistrationVariableDTO> {
    return this.applicationRegistrationVariableService.updateVariableGlobal(
      input,
    );
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => InstanceAndAllWorkspacesUpgradeStatusDTO)
  async getInstanceAndAllWorkspacesUpgradeStatus(): Promise<InstanceAndAllWorkspacesUpgradeStatusDTO> {
    return this.upgradeStatusService.getInstanceAndAllWorkspacesStatus();
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => InstanceAndAllWorkspacesUpgradeStatusDTO)
  async refreshUpgradeStatus(): Promise<InstanceAndAllWorkspacesUpgradeStatusDTO> {
    return this.upgradeStatusService.refreshInstanceAndAllWorkspacesStatus();
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => [WorkspaceUpgradeStatusDTO])
  async getUpgradeStatus(
    @Args('workspaceIds', { type: () => [UUIDScalarType] })
    workspaceIds: string[],
  ): Promise<WorkspaceUpgradeStatusDTO[]> {
    if (workspaceIds.length === 0) {
      return [];
    }

    return this.upgradeStatusService.getWorkspaceStatuses(workspaceIds);
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => SigningKeysAdminPanelDTO)
  async getSigningKeys(): Promise<SigningKeysAdminPanelDTO> {
    return this.adminPanelSigningKeyService.getSigningKeys();
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => SigningKeyDTO)
  async revokeSigningKey(
    @Args() { id }: RevokeSigningKeyInput,
  ): Promise<SigningKeyDTO> {
    return this.adminPanelSigningKeyService.revokeSigningKey(id);
  }
}
