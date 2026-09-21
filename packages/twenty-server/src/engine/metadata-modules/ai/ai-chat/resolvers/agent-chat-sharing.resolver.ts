import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query } from '@nestjs/graphql';

import { PermissionFlagType } from 'twenty-shared/constants';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RecordShareException } from 'src/engine/core-modules/record-share/record-share.exception';
import { recordShareGraphqlApiExceptionHandler } from 'src/engine/core-modules/record-share/utils/record-share-graphql-api-exception-handler.util';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import {
  ChatThreadShareTargetInput,
  ChatThreadSharingDTO,
} from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-thread-sharing.dto';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AiGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/ai/interceptors/ai-graphql-api-exception.interceptor';

@MetadataResolver()
@UseGuards(
  WorkspaceAuthGuard,
  UserAuthGuard,
  SettingsPermissionGuard(PermissionFlagType.AI),
)
@UseInterceptors(AiGraphqlApiExceptionInterceptor)
export class AgentChatSharingResolver {
  constructor(private readonly sharingService: AgentChatSharingService) {}

  @Query(() => ChatThreadSharingDTO)
  async chatThreadSharing(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    return this.sharingService.getSharing({
      threadId,
      workspaceId,
      userWorkspaceId,
    });
  }

  @Mutation(() => ChatThreadSharingDTO)
  async setChatThreadShare(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @Args('target') target: ChatThreadShareTargetInput,
    @Args('enabled') enabled: boolean,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    try {
      return await this.sharingService.setShare({
        threadId,
        workspaceId,
        userWorkspaceId,
        target,
        enabled,
      });
    } catch (error) {
      if (error instanceof RecordShareException) {
        recordShareGraphqlApiExceptionHandler(error);
      }
      throw error;
    }
  }
}
