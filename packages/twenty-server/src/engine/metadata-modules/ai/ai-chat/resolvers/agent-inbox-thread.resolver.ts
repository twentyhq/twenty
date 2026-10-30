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
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { InboxThreadRecordInputDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/inbox-thread-record.input';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { AgentInboxAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-access.service';
import { getInboxCallerAuthContextOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-inbox-caller-auth-context-or-throw.util';
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
    application: { withUser: true, withoutUser: true },
  }),
  SettingsPermissionGuard(PermissionFlagType.AI),
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
    const authContext = getInboxCallerAuthContextOrThrow();

    await this.inboxAccessService.assertThreadIsWritableOrThrow({
      authContext,
      threadId: input.threadId,
    });

    return { ...input, workspaceId: authContext.workspace.id, authContext };
  }
}
