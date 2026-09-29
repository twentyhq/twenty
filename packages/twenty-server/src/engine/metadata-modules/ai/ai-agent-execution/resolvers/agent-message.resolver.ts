import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { isDefined } from 'twenty-shared/utils';
import { AgentMessageDTO } from 'src/engine/metadata-modules/ai/ai-agent-execution/dtos/agent-message.dto';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';

@Resolver(() => AgentMessageDTO)
export class AgentMessageResolver {
  @ResolveField(() => Date)
  createdAt(@Parent() message: AgentMessageWorkspaceEntity): Date {
    return new Date(message.createdAt);
  }

  @ResolveField(() => Date, { nullable: true })
  processedAt(@Parent() message: AgentMessageWorkspaceEntity): Date | null {
    return isDefined(message.processedAt)
      ? new Date(message.processedAt)
      : null;
  }
}
