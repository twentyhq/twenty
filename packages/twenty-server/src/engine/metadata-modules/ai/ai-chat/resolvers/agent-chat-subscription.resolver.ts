import { Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequireFeatureFlag } from 'src/engine/core-modules/feature-flag/decorators/require-feature-flag.decorator';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatEventDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-event.dto';

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class AgentChatSubscriptionResolver {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @InjectRepository(AgentChatThreadEntity)
    private readonly threadRepository: Repository<AgentChatThreadEntity>,
  ) {}

  @Subscription(() => AgentChatEventDTO, {
    filter: (
      payload: { onAgentChatEvent: AgentChatEventDTO },
      variables: { threadId: string },
    ) => {
      return payload.onAgentChatEvent.threadId === variables.threadId;
    },
  })
  @RequireFeatureFlag(FeatureFlagKey.IS_AI_ENABLED)
  @UseGuards(SettingsPermissionGuard(PermissionFlagType.AI))
  async onAgentChatEvent(
    @Args('threadId', { type: () => UUIDScalarType }) threadId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @AuthUserWorkspaceId() userWorkspaceId: string,
  ) {
    const thread = await this.threadRepository.findOne({
      where: { id: threadId, userWorkspaceId },
      select: ['id'],
    });

    if (!isDefined(thread)) {
      throw new AgentException(
        'Thread not found',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }

    return this.subscriptionService.subscribeToAgentChat({
      workspaceId: workspace.id,
      threadId,
    });
  }
}
