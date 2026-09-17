import { UseGuards } from '@nestjs/common';
import { Args, Field, Mutation, ObjectType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

@ObjectType('ToolCallResult')
export class ToolCallResultDTO {
  @Field()
  success: boolean;

  @Field()
  message: string;

  @Field({ nullable: true })
  error?: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  result?: object;
}

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard)
export class ToolCallResolver {
  constructor(
    private readonly toolRegistryService: ToolRegistryService,
    private readonly userRoleService: UserRoleService,
  ) {}

  // Lets a tool widget run a tool without a model turn. The tool registry
  // resolves the call against the caller's own role, so a widget can never
  // reach further than the person looking at it and there is no settings flag
  // to guard on here.
  @Mutation(() => ToolCallResultDTO)
  @UseGuards(NoPermissionGuard)
  async callTool(
    @Args('toolName') toolName: string,
    @Args('input', { type: () => graphqlTypeJson, nullable: true })
    input: Record<string, unknown> | undefined,
    @AuthUser() user: UserEntity,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ): Promise<ToolCallResultDTO> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      userWorkspaceId,
      workspaceId: workspace.id,
    });

    // The person clicked the widget themselves, so what the call writes is
    // theirs rather than an agent's or a workflow's.
    const actorContext: ActorMetadata = {
      source: FieldActorSource.MANUAL,
      workspaceMemberId,
      name: `${user.firstName} ${user.lastName}`.trim(),
      context: {},
    };

    const output = await this.toolRegistryService.resolveAndExecute(
      toolName,
      input,
      {
        workspaceId: workspace.id,
        roleId,
        actorContext,
        userId: user.id,
        userWorkspaceId,
        locale,
      },
    );

    return {
      success: output.success,
      message: output.message,
      error: output.error,
      result: output.result,
    };
  }
}
