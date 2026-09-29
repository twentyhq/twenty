import { UseGuards } from '@nestjs/common';
import { Args, Field, ObjectType, Query } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { resolveRoleIdsForUser } from 'src/engine/twenty-orm/utils/resolve-role-ids-for-user.util';

@ObjectType('ToolIndexEntry')
export class ToolIndexEntryDTO {
  @Field()
  name: string;

  @Field()
  label: string;

  @Field()
  description: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  objectName?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  widgetName?: string;

  @Field({ nullable: true })
  frontComponentId?: string;

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
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ): Promise<ToolIndexEntryDTO[]> {
    const { userRoleId, roleIds } = await this.resolveCallerRoles({
      userWorkspaceId,
      workspaceId: workspace.id,
      application,
    });

    return this.toolRegistryService.buildToolIndex(workspace.id, userRoleId, {
      rolePermissionConfig: { intersectionOf: roleIds },
      userId: user?.id,
      userWorkspaceId,
      locale,
      application,
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
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
  ): Promise<object | null> {
    const { userRoleId, roleIds } = await this.resolveCallerRoles({
      userWorkspaceId,
      workspaceId: workspace.id,
      application,
    });

    const schemas = await this.toolRegistryService.resolveSchemas({
      toolNames: [toolName],
      context: {
        workspaceId: workspace.id,
        roleId: userRoleId,
        rolePermissionConfig: { intersectionOf: roleIds },
        userId: user?.id,
        userWorkspaceId,
        application,
      },
    });

    return schemas.get(toolName) ?? null;
  }

  private async resolveCallerRoles({
    userWorkspaceId,
    workspaceId,
    application,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
    application: FlatApplication | undefined;
  }): Promise<{ userRoleId: string; roleIds: string[] }> {
    const userRoleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId,
      workspaceId,
    });

    return {
      userRoleId,
      roleIds: resolveRoleIdsForUser({
        userRoleId,
        applicationRoleId: application?.defaultRoleId,
      }),
    };
  }
}
