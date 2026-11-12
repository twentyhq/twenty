import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { InboxThreadRecordInputDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/inbox-thread-record.input';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { AgentInboxAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-access.service';
import { getAgentInboxCallerAuthContextOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-inbox-caller-auth-context-or-throw.util';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';
import { AccessPolicyGuard } from 'src/engine/guards/access-policy.guard';

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
      oauthClient: { withUser: true, withoutUser: false },
      application: true,
    },
    requiredPermissionFlags: [PermissionFlagType.AI],
  }),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
@UseFilters(AuthGraphqlApiExceptionFilter)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class AgentInboxThreadResolver {
  constructor(
    private readonly inboxAccessService: AgentInboxAccessService,
    private readonly threadTargetService: AgentChatThreadTargetService,
  ) {}

  @Mutation(() => Boolean)
  async attachRecordToInboxThread(
    @Args('input') input: InboxThreadRecordInputDTO,
  ): Promise<boolean> {
    await this.threadTargetService.attachThreadToRecord(
      await this.authorizeThreadRecordLink(input),
    );

    return true;
  }

  @Mutation(() => Boolean)
  async detachRecordFromInboxThread(
    @Args('input') input: InboxThreadRecordInputDTO,
  ): Promise<boolean> {
    await this.threadTargetService.detachThreadFromRecord(
      await this.authorizeThreadRecordLink(input),
    );

    return true;
  }

  private async authorizeThreadRecordLink(input: InboxThreadRecordInputDTO) {
    const authContext = getAgentInboxCallerAuthContextOrThrow();

    await this.inboxAccessService.assertThreadIsWritableOrThrow({
      authContext,
      threadId: input.threadId,
    });

    return { ...input, workspaceId: authContext.workspace.id, authContext };
  }
}
