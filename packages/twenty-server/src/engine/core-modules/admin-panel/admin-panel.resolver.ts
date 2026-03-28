import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Int, Mutation, Query } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { AdminPanelQueueService } from 'src/engine/core-modules/admin-panel/admin-panel-queue.service';
import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { AdminAIModelsDTO } from 'src/engine/core-modules/client-config/client-config.entity';
import { AiModelRole } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-role.enum';
import { ConfigVariableDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variable.dto';
import { ConfigVariablesDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variables.dto';
import { DeleteJobsResponseDTO } from 'src/engine/core-modules/admin-panel/dtos/delete-jobs-response.dto';
import { QueueJobsResponseDTO } from 'src/engine/core-modules/admin-panel/dtos/queue-jobs-response.dto';
import { RetryJobsResponseDTO } from 'src/engine/core-modules/admin-panel/dtos/retry-jobs-response.dto';
import { SystemHealthDTO } from 'src/engine/core-modules/admin-panel/dtos/system-health.dto';
import { UpdateWorkspaceFeatureFlagInput } from 'src/engine/core-modules/admin-panel/dtos/update-workspace-feature-flag.input';
import { UserLookup } from 'src/engine/core-modules/admin-panel/dtos/user-lookup.dto';
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
import { HealthIndicatorId } from 'src/engine/core-modules/admin-panel/enums/health-indicator-id.enum';
import { type MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigVariableGraphqlApiExceptionFilter } from 'src/engine/core-modules/twenty-config/filters/config-variable-graphql-api-exception.filter';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { ModelsDevCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/models-dev-catalog.service';
import { MODEL_FAMILY_LABELS } from 'src/engine/metadata-modules/ai/ai-models/constants/model-family-labels.const';
import { type AiProviderConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.type';
import { type AiProviderModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-model-config.type';
import { extractConfigVariableName } from 'src/engine/metadata-modules/ai/ai-models/utils/extract-config-variable-name.util';
import { loadDefaultAiProviders } from 'src/engine/metadata-modules/ai/ai-models/utils/load-default-ai-providers.util';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { ServerLevelImpersonateGuard } from 'src/engine/guards/server-level-impersonate.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { AdminPanelHealthServiceDataDTO } from './dtos/admin-panel-health-service-data.dto';
import { ModelsDevModelSuggestionDTO } from './dtos/models-dev-model-suggestion.dto';
import { ModelsDevProviderSuggestionDTO } from './dtos/models-dev-provider-suggestion.dto';
import { QueueMetricsDataDTO } from './dtos/queue-metrics-data.dto';

@UsePipes(ResolverValidationPipe)
@MetadataResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
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
    private readonly adminService: AdminPanelService,
    private readonly adminPanelHealthService: AdminPanelHealthService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private adminPanelQueueService: AdminPanelQueueService,
    private featureFlagService: FeatureFlagService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly modelsDevCatalogService: ModelsDevCatalogService,
  ) {}

  @UseGuards(ServerLevelImpersonateGuard)
  @Mutation(() => UserLookup)
  async userLookupAdminPanel(
    @Args() userLookupInput: UserLookupInput,
  ): Promise<UserLookup> {
    return await this.adminService.userLookup(userLookupInput.userIdentifier);
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
    return this.adminService.getConfigVariablesGrouped();
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
    return this.adminService.getVersionInfo();
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => AdminAIModelsDTO)
  async getAdminAiModels(): Promise<AdminAIModelsDTO> {
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

    const prefs = this.twentyConfigService.get('AI_MODEL_PREFERENCES');

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
  async setAdminAiModelRecommended(
    @Args('modelId', { type: () => String }) modelId: string,
    @Args('recommended', { type: () => Boolean }) recommended: boolean,
  ): Promise<boolean> {
    await this.aiModelRegistryService.setModelRecommended(modelId, recommended);

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

    return this.adminService.getConfigVariable(key);
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
  @Query(() => [ApplicationRegistrationEntity])
  async findAllApplicationRegistrations(): Promise<
    ApplicationRegistrationEntity[]
  > {
    return this.applicationRegistrationService.findAll();
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => GraphQLJSON)
  async getAiProviders(): Promise<Record<string, unknown>> {
    const providers =
      this.aiModelRegistryService.getResolvedProvidersForAdmin();
    const catalogNames = this.aiModelRegistryService.getCatalogProviderNames();
    const rawCatalog = loadDefaultAiProviders();
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
    this.aiModelRegistryService.refreshRegistry();

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
    this.aiModelRegistryService.refreshRegistry();

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
    this.aiModelRegistryService.refreshRegistry();

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
    this.aiModelRegistryService.refreshRegistry();

    return true;
  }
}
