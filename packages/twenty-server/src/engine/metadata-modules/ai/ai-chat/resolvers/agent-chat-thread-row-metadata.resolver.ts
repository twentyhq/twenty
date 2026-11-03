import {
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';
import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { AgentChatThreadRowMetadataArgs } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-row-metadata.args';
import { AgentChatThreadRowMetadataDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread-row-metadata.dto';
import { AgentChatThreadRowMetadataService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-row-metadata.service';
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
@UseFilters(AuthGraphqlApiExceptionFilter)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class AgentChatThreadRowMetadataResolver {
  constructor(
    private readonly rowMetadataService: AgentChatThreadRowMetadataService,
  ) {}

  @Query(() => [AgentChatThreadRowMetadataDTO])
  agentChatThreadRowMetadata(
    @Args() { threadIds }: AgentChatThreadRowMetadataArgs,
  ): Promise<AgentChatThreadRowMetadataDTO[]> {
    return this.rowMetadataService.find(threadIds);
  }
}
