import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UpdateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/update-usage-limit.input';
import { CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import { UsageQuotaDefinitionsDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-definitions.dto';
import { UsageQuotaWithConsumptionDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-with-consumption.dto';
import { UsageQuotaScopeConsumptionDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-scope-consumption.dto';
import { UsageQuotaScopeInput } from 'src/engine/core-modules/usage-limit/dtos/usage-quota-scope.input';
import { UsageLimitDTO } from 'src/engine/core-modules/usage-limit/dtos/usage-limit.dto';
import { UsageLimitGraphqlApiExceptionFilter } from 'src/engine/core-modules/usage-limit/filters/usage-limit-graphql-api-exception.filter';
import { UsageQuotaConsumptionService } from 'src/engine/core-modules/usage-limit/services/usage-quota-consumption.service';
import { UsageQuotaDefinitionService } from 'src/engine/core-modules/usage-limit/services/usage-quota-definition.service';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { fromUsageLimitEntityToDto } from 'src/engine/core-modules/usage-limit/utils/from-usage-limit-entity-to-dto.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@MetadataResolver(() => UsageLimitDTO)
@UseFilters(
  UsageLimitGraphqlApiExceptionFilter,
  PreventNestToAutoLogGraphqlErrorsFilter,
)
@UsePipes(ResolverValidationPipe)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
export class UsageLimitResolver {
  constructor(
    private readonly usageLimitService: UsageLimitService,
    private readonly usageQuotaConsumptionService: UsageQuotaConsumptionService,
    private readonly usageQuotaDefinitionService: UsageQuotaDefinitionService,
  ) {}

  @Query(() => [UsageLimitDTO])
  async usageLimits(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<UsageLimitDTO[]> {
    const usageLimits = await this.usageLimitService.findAll(workspace.id);

    return usageLimits.map(fromUsageLimitEntityToDto);
  }

  @Query(() => [UsageQuotaWithConsumptionDTO])
  async usageQuotasWithConsumption(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<UsageQuotaWithConsumptionDTO[]> {
    return this.usageQuotaConsumptionService.findQuotasWithConsumption(
      workspace.id,
    );
  }

  @Query(() => UsageQuotaDefinitionsDTO)
  async usageQuotaDefinitions(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<UsageQuotaDefinitionsDTO> {
    return this.usageQuotaDefinitionService.findDefinitions(workspace.id);
  }

  @Query(() => UsageQuotaScopeConsumptionDTO, { nullable: true })
  async usageQuotaScopeConsumption(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: UsageQuotaScopeInput,
  ): Promise<UsageQuotaScopeConsumptionDTO | null> {
    return this.usageQuotaConsumptionService.findConsumptionForScope({
      workspaceId: workspace.id,
      scope: input,
    });
  }

  @Mutation(() => UsageLimitDTO)
  async createUsageLimit(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: CreateUsageLimitInput,
  ): Promise<UsageLimitDTO> {
    const usageLimit = await this.usageLimitService.create({
      workspaceId: workspace.id,
      input,
    });

    return fromUsageLimitEntityToDto(usageLimit);
  }

  @Mutation(() => UsageLimitDTO)
  async updateUsageLimit(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: UpdateUsageLimitInput,
  ): Promise<UsageLimitDTO> {
    const usageLimit = await this.usageLimitService.update({
      workspaceId: workspace.id,
      input,
    });

    return fromUsageLimitEntityToDto(usageLimit);
  }

  @Mutation(() => Boolean)
  async deleteUsageLimit(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('usageLimitId', { type: () => UUIDScalarType }) usageLimitId: string,
  ): Promise<boolean> {
    return this.usageLimitService.delete({
      workspaceId: workspace.id,
      usageLimitId,
    });
  }
}
