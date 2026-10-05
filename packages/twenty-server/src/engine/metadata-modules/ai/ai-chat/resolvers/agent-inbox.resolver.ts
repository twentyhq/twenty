import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { SendInboxMessageResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-inbox-message-result.dto';
import { SendInboxMessageInputDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-inbox-message.input';
import { AgentInboxProposalService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-proposal.service';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

@UseGuards(
  AuthPrincipalGuard({
    userSession: false,
    apiKey: false,
    oauthClient: false,
    application: true,
  }),
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class AgentInboxResolver {
  constructor(
    private readonly agentInboxService: AgentInboxService,
    private readonly agentInboxProposalService: AgentInboxProposalService,
  ) {}

  @Mutation(() => SendInboxMessageResultDTO)
  async sendInboxMessage(
    @Args('input') input: SendInboxMessageInputDTO,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthApplication() application: FlatApplication,
  ): Promise<SendInboxMessageResultDTO> {
    return this.agentInboxService.sendMessage({
      workspaceId: workspace.id,
      sender: { type: 'application', application },
      input,
      context: {
        resolveProposal: (proposeToolCallInput) =>
          this.agentInboxProposalService.resolveApplicationProposal({
            workspaceId: workspace.id,
            application,
            input: proposeToolCallInput,
          }),
      },
    });
  }
}
