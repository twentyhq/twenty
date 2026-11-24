import { UseGuards } from '@nestjs/common';
import { Float, Parent, ResolveField } from '@nestjs/graphql';

import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@MetadataResolver(() => AgentChatThreadDTO)
export class AgentChatThreadResolver {
  @ResolveField(() => Date)
  @UseGuards(NoPermissionGuard)
  createdAt(@Parent() thread: AgentChatThreadWorkspaceEntity): Date {
    return new Date(thread.createdAt);
  }

  @ResolveField(() => Date)
  @UseGuards(NoPermissionGuard)
  updatedAt(@Parent() thread: AgentChatThreadWorkspaceEntity): Date {
    return new Date(thread.updatedAt);
  }

  @ResolveField(() => Date, { nullable: true })
  @UseGuards(NoPermissionGuard)
  deletedAt(@Parent() thread: AgentChatThreadWorkspaceEntity): Date | null {
    return isDefined(thread.deletedAt) ? new Date(thread.deletedAt) : null;
  }

  @ResolveField(() => Float)
  @UseGuards(NoPermissionGuard)
  totalInputCredits(@Parent() thread: AgentChatThreadWorkspaceEntity): number {
    return toDisplayCredits(Number(thread.totalInputCredits));
  }

  @ResolveField(() => Float)
  @UseGuards(NoPermissionGuard)
  totalOutputCredits(@Parent() thread: AgentChatThreadWorkspaceEntity): number {
    return toDisplayCredits(Number(thread.totalOutputCredits));
  }
}
