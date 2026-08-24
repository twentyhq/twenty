import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UpsertUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/upsert-usage-limit.input';
import { UsageLimitService } from 'src/engine/core-modules/usage-limit/services/usage-limit.service';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
@MetadataResolver(() => UsageLimitEntity)
@UseGuards(
  WorkspaceAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.WORKSPACE),
)
export class UsageLimitResolver {
  constructor(private readonly usageLimitService: UsageLimitService) {}

  @Query(() => [UsageLimitEntity])
  async usageLimits(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<UsageLimitEntity[]> {
    return this.usageLimitService.findAll(workspace.id);
  }

  @Mutation(() => UsageLimitEntity)
  async upsertUsageLimit(
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('input') input: UpsertUsageLimitInput,
  ): Promise<UsageLimitEntity> {
    return this.usageLimitService.upsert({ workspaceId: workspace.id, input });
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
