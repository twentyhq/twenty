import { UseGuards } from '@nestjs/common';
import { Args, Field, ObjectType, Query } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

@ObjectType('ToolIndexEntry')
export class ToolIndexEntryDTO {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  objectName?: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  inputSchema?: object;
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard)
export class ToolIndexResolver {
  constructor(
    private readonly toolRegistryService: ToolRegistryService,
    private readonly userRoleService: UserRoleService,
  ) {}

  @Query(() => [ToolIndexEntryDTO])
  @UseGuards(NoPermissionGuard)
  async getToolIndex(
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<ToolIndexEntryDTO[]> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    if (!roleId) {
      return [];
    }

    return this.toolRegistryService.buildToolIndex(workspace.id, roleId, {
      userId: user?.id,
      userWorkspaceId,
    });
  }

  // Resolves the inputSchema for a single tool on demand (avoids computing
  // schemas for every tool in the workspace when listing the tool index).
  @Query(() => graphqlTypeJson, { nullable: true })
  @UseGuards(NoPermissionGuard)
  async getToolInputSchema(
    @Args('toolName') toolName: string,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ): Promise<object | null> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    if (!roleId) {
      return null;
    }

    const schemas = await this.toolRegistryService.resolveSchemas([toolName], {
      workspaceId: workspace.id,
      roleId,
      rolePermissionConfig: { unionOf: [roleId] },
      userId: user?.id,
      userWorkspaceId,
    });

    return schemas.get(toolName) ?? null;
  }
}
