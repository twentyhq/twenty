/* @license Enterprise */

import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';

import { AdminResolver } from 'src/engine/api/graphql/graphql-config/decorators/admin-resolver.decorator';
import { CustomAiProviderAccessDTO } from 'src/engine/core-modules/admin-panel/dtos/custom-ai-provider-access.dto';
import { AdminPanelAiProviderService } from 'src/engine/core-modules/admin-panel/services/admin-panel-ai-provider.service';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { EnterpriseExceptionFilter } from 'src/engine/core-modules/enterprise/enterprise-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { ConfigVariableGraphqlApiExceptionFilter } from 'src/engine/core-modules/twenty-config/filters/config-variable-graphql-api-exception.filter';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ModelsDevModelSuggestionDTO } from 'src/engine/core-modules/admin-panel/dtos/models-dev-model-suggestion.dto';
import { ModelsDevProviderSuggestionDTO } from 'src/engine/core-modules/admin-panel/dtos/models-dev-provider-suggestion.dto';
import { ModelsDevCatalogService } from 'src/engine/metadata-modules/ai/ai-models/services/models-dev-catalog.service';

@UsePipes(ResolverValidationPipe)
@AdminResolver()
@UseFilters(
  AuthGraphqlApiExceptionFilter,
  EnterpriseExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
  ConfigVariableGraphqlApiExceptionFilter,
)
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.SECURITY),
)
export class AdminPanelAiProviderResolver {
  constructor(
    private readonly adminPanelAiProviderService: AdminPanelAiProviderService,
    private readonly modelsDevCatalogService: ModelsDevCatalogService,
  ) {}

  @UseGuards(AdminPanelGuard)
  @Query(() => CustomAiProviderAccessDTO)
  async getCustomAiProviderAccess(): Promise<CustomAiProviderAccessDTO> {
    return this.adminPanelAiProviderService.getCustomAiProviderAccess();
  }

  @UseGuards(AdminPanelGuard)
  @Query(() => GraphQLJSON)
  async getAiProviders(): Promise<Record<string, unknown>> {
    return this.adminPanelAiProviderService.getMaskedProviders();
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async addAiProvider(
    @Args('providerName', { type: () => String }) providerName: string,
    @Args('providerConfig', { type: () => GraphQLJSON })
    providerConfig: unknown,
  ): Promise<boolean> {
    return this.adminPanelAiProviderService.addProvider({
      providerName,
      providerConfig,
    });
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async removeAiProvider(
    @Args('providerName', { type: () => String })
    providerName: string,
  ): Promise<boolean> {
    return this.adminPanelAiProviderService.removeProvider(providerName);
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
    modelConfig: unknown,
  ): Promise<boolean> {
    return this.adminPanelAiProviderService.addModelToProvider({
      providerName,
      modelConfig,
    });
  }

  @UseGuards(AdminPanelGuard)
  @Mutation(() => Boolean)
  async removeModelFromProvider(
    @Args('providerName', { type: () => String }) providerName: string,
    @Args('modelName', { type: () => String }) modelName: string,
  ): Promise<boolean> {
    return this.adminPanelAiProviderService.removeModelFromProvider({
      providerName,
      modelName,
    });
  }
}
