import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { AuthenticationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { InboxThreadRecordInputDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/inbox-thread-record.input';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { AgentInboxAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-access.service';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';
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
    const authContext = this.getCallerAuthContextOrThrow();

    await this.inboxAccessService.assertThreadIsWritableOrThrow({
      authContext,
      threadId: input.threadId,
    });

    return { ...input, workspaceId: authContext.workspace.id, authContext };
  }

  private getCallerAuthContextOrThrow(): AgentInboxCallerAuthContext {
    const authContext = getWorkspaceAuthContext();

    if (
      isUserAuthContext(authContext) ||
      isApplicationAuthContext(authContext)
    ) {
      return authContext;
    }

    throw new AuthenticationError(
      'A workspace member or an application is required',
      {
        userFriendlyMessage: msg`Sign in as a workspace member or use an application token to change this conversation.`,
      },
    );
  }
}
