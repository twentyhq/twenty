import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { ArchiveInboxThreadInputDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/archive-inbox-thread.input';
import { SendInboxMessageResultDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-inbox-message-result.dto';
import { SendInboxMessageInputDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/send-inbox-message.input';
import { AgentChatInboxAction } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-action.enum';
import { AgentChatThreadTriageService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-triage.service';
import { AgentInboxAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-access.service';
import { AgentInboxProposalService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-proposal.service';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';
import { getAgentInboxCallerAuthContextOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-inbox-caller-auth-context-or-throw.util';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

@UseGuards(
  AccessPolicyGuard({
    authPrincipals: {
      userSession: false,
      apiKey: false,
      oauthClient: false,
      application: true,
    },
    requiredPermissionFlags: [PermissionFlagType.AI],
  }),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class AgentInboxResolver {
  constructor(
    private readonly agentInboxService: AgentInboxService,
    private readonly agentInboxProposalService: AgentInboxProposalService,
    private readonly inboxAccessService: AgentInboxAccessService,
    private readonly triageService: AgentChatThreadTriageService,
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
      resolveProposal: (proposeToolCallInput) =>
        this.agentInboxProposalService.resolveApplicationProposal({
          workspaceId: workspace.id,
          application,
          input: proposeToolCallInput,
        }),
    });
  }

  @Mutation(() => Boolean)
  async archiveInboxThread(
    @Args('input') input: ArchiveInboxThreadInputDTO,
  ): Promise<boolean> {
    const authContext = getAgentInboxCallerAuthContextOrThrow();

    // Without members, the conversation is marked done in its channel
    if (!isDefined(input.workspaceMemberIds)) {
      await this.triageService.applyToChannelCopy({
        threadId: input.threadId,
        change: { action: AgentChatInboxAction.ARCHIVE },
        authContext,
        isCallerInboxKept: true,
      });

      return true;
    }

    await this.inboxAccessService.assertThreadIsWritableOrThrow({
      authContext,
      threadId: input.threadId,
    });

    await this.triageService.archiveForMembers({
      workspaceId: authContext.workspace.id,
      threadId: input.threadId,
      workspaceMemberIds: input.workspaceMemberIds,
    });

    return true;
  }
}
