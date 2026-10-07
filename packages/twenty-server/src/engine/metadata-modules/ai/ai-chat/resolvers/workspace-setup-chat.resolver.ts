import { AuthWorkspaceMemberId } from 'src/engine/decorators/auth/auth-workspace-member-id.decorator';
import { UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import {
  type WorkspaceCompanyEnrichment,
  type WorkspacePersonEnrichment,
} from 'twenty-shared/workspace';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { matchWorkspacePersonEnrichmentToUserEmail } from 'src/engine/core-modules/company-enrichment/utils/match-workspace-person-enrichment-to-user-email.util';
import { sanitizeWorkspaceCompanyEnrichment } from 'src/engine/core-modules/company-enrichment/utils/sanitize-workspace-company-enrichment.util';
import { sanitizeWorkspacePersonEnrichment } from 'src/engine/core-modules/company-enrichment/utils/sanitize-workspace-person-enrichment.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthIsUserSession } from 'src/engine/decorators/auth/auth-is-user-session.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { StartWorkspaceSetupChatResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/start-workspace-setup-chat-result.dto';
import { WorkspaceSetupChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/workspace-setup-chat.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

@UseGuards(
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: { withUser: true, withoutUser: false },
    application: { withUser: true, withoutUser: false },
  }),
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@MetadataResolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class WorkspaceSetupChatResolver {
  constructor(
    private readonly workspaceSetupChatService: WorkspaceSetupChatService,
  ) {}

  @Mutation(() => StartWorkspaceSetupChatResultDTO)
  async startWorkspaceSetupChat(
    @Args('companyContext', { type: () => GraphQLJSON, nullable: true })
    companyContext: WorkspaceCompanyEnrichment | null,
    @Args('personContext', { type: () => GraphQLJSON, nullable: true })
    personContext: WorkspacePersonEnrichment | null,
    @AuthUser() user: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspaceMemberId() workspaceMemberId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthIsUserSession() isUserSession: boolean,
  ) {
    return this.workspaceSetupChatService.startWorkspaceSetupChat({
      userId: user.id,
      userEmail: user.email,
      userLocale: user.locale,
      userWorkspaceId,
      workspaceMemberId,
      workspace,
      companyContext: sanitizeWorkspaceCompanyEnrichment(companyContext),
      personContext: matchWorkspacePersonEnrichmentToUserEmail({
        personEnrichment: sanitizeWorkspacePersonEnrichment(personContext),
        userEmail: user.email,
      }),
      principalType: isUserSession ? 'userSession' : 'application',
    });
  }
}
