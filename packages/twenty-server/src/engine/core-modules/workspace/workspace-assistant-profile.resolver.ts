import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { PreventNestToAutoLogGraphqlErrorsFilter } from 'src/engine/core-modules/graphql/filters/prevent-nest-to-auto-log-graphql-errors.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { AiChatAssistantProfileDTO } from 'src/engine/core-modules/workspace/dtos/ai-chat-assistant-profile.dto';
import { WorkspaceAssistantProfileService } from 'src/engine/core-modules/workspace/services/workspace-assistant-profile.service';
import { workspaceGraphqlApiExceptionHandler } from 'src/engine/core-modules/workspace/utils/workspace-graphql-api-exception-handler.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/permissions/utils/permissions-graphql-api-exception.filter';

@MetadataResolver(() => WorkspaceEntity)
@UsePipes(ResolverValidationPipe)
@UseFilters(
  PreventNestToAutoLogGraphqlErrorsFilter,
  PermissionsGraphqlApiExceptionFilter,
  AuthGraphqlApiExceptionFilter,
)
export class WorkspaceAssistantProfileResolver {
  constructor(
    private readonly workspaceAssistantProfileService: WorkspaceAssistantProfileService,
  ) {}

  @Mutation(() => AiChatAssistantProfileDTO)
  @UseGuards(
    AccessPolicyGuard({
      authPrincipals: {
        userSession: {
          standard: true,
          impersonated: true,
          playground: true,
          workspaceAgnostic: false,
        },
        apiKey: false,
        oauthClient: false,
        application: false,
      },
      requiredPermissionFlags: [PermissionFlagType.AI_SETTINGS],
      requiredFeatureFlags: [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED],
    }),
  )
  async resetAiChatAssistantProfile(
    @AuthWorkspace() workspace: WorkspaceEntity,
  ) {
    try {
      return await this.workspaceAssistantProfileService.reset(workspace.id);
    } catch (error) {
      workspaceGraphqlApiExceptionHandler(error);
    }
  }
}
