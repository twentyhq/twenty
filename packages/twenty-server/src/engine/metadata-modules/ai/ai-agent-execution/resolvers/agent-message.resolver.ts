import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { isDefined } from 'twenty-shared/utils';
import { AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';

@Resolver(() => AgentMessageDTO)
export class AgentMessageResolver {
  @ResolveField(() => Date)
  @UseGuards(NoPermissionGuard)
  createdAt(@Parent() message: AgentMessageWorkspaceEntity): Date {
    return new Date(message.createdAt);
  }

  @ResolveField(() => Date, { nullable: true })
  @UseGuards(NoPermissionGuard)
  processedAt(@Parent() message: AgentMessageWorkspaceEntity): Date | null {
    return isDefined(message.processedAt)
      ? new Date(message.processedAt)
      : null;
  }
}
