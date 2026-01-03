import { UseGuards } from '@nestjs/common';
import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
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

@Resolver()
@UseGuards(WorkspaceAuthGuard)
export class ToolIndexResolver {
  constructor(
    private readonly toolRegistryService: ToolRegistryService,
    private readonly userRoleService: UserRoleService,
  ) {}

  @Query(() => [ToolIndexEntryDTO])
  @UseGuards(NoPermissionGuard)
  async getToolIndex(
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
      userWorkspaceId,
    });
  }
}
