import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { sanitizeWorkspaceCompanyEnrichment } from 'src/engine/core-modules/company-enrichment/utils/sanitize-workspace-company-enrichment.util';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { StartWorkspaceSetupChatResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/start-workspace-setup-chat-result.dto';
import { WorkspaceSetupChatOutcome } from 'src/engine/metadata-modules/ai/ai-chat/enums/workspace-setup-chat-outcome.enum';
import { WorkspaceSetupChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/workspace-setup-chat.service';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@MetadataResolver()
export class WorkspaceSetupChatResolver {
  constructor(
    private readonly workspaceSetupChatService: WorkspaceSetupChatService,
  ) {}

  @Mutation(() => StartWorkspaceSetupChatResultDTO)
  async startWorkspaceSetupChat(
    @Args('companyContext', { type: () => GraphQLJSON, nullable: true })
    companyContext: WorkspaceCompanyEnrichment | null,
    @AuthUser() user: AuthContextUser,
    @AuthUserWorkspaceId() userWorkspaceId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<StartWorkspaceSetupChatResultDTO> {
    const result = await this.workspaceSetupChatService.startWorkspaceSetupChat(
      {
        userId: user.id,
        userWorkspaceId,
        workspace,
        companyContext: sanitizeWorkspaceCompanyEnrichment(companyContext),
      },
    );

    if (result.outcome === 'started') {
      tagAiChatStreamScope({
        streamId: result.streamId,
        turnId: result.turnId,
        threadId: result.threadId,
        workspaceId: workspace.id,
      });

      return {
        outcome: WorkspaceSetupChatOutcome.started,
        threadId: result.threadId,
        streamId: result.streamId,
      };
    }

    return {
      outcome: WorkspaceSetupChatOutcome[result.outcome],
      threadId: result.threadId,
      streamId: null,
    };
  }
}
