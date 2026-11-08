import { UseGuards } from '@nestjs/common';
import { Args, Field, ObjectType, Query } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';
import { type APP_LOCALES } from 'twenty-shared/translations';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequestLocale } from 'src/engine/decorators/locale/request-locale.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

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
@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: {
        standard: true,
        impersonated: true,
        playground: true,
        workspaceAgnostic: false,
      },
      apiKey: true,
      oauthClient: true,
      application: true,
    },
    requiredPermissionFlags: [],
  }),
)
export class ToolIndexResolver {
  constructor(private readonly toolRegistryService: ToolRegistryService) {}

  @Query(() => [ToolIndexEntryDTO])
  async getToolIndex(
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
    @RequestLocale() locale: keyof typeof APP_LOCALES | undefined,
  ): Promise<ToolIndexEntryDTO[]> {
    return this.toolRegistryService.buildToolIndex(workspace.id, {
      userId: user?.id,
      userWorkspaceId,
      locale,
      authContext: getWorkspaceAuthContext(),
      application,
    });
  }

  // On demand, so listing the tool index does not compute every tool's schema.
  @Query(() => graphqlTypeJson, { nullable: true })
  async getToolInputSchema(
    @Args('toolName') toolName: string,
    @AuthUser({ allowUndefined: true }) user: UserEntity | undefined,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthApplication({ allowUndefined: true })
    application: FlatApplication | undefined,
  ): Promise<object | null> {
    const schemas = await this.toolRegistryService.resolveSchemas({
      toolNames: [toolName],
      context: {
        workspaceId: workspace.id,
        userId: user?.id,
        userWorkspaceId,
        authContext: getWorkspaceAuthContext(),
        application,
      },
    });

    return schemas.get(toolName) ?? null;
  }
}
