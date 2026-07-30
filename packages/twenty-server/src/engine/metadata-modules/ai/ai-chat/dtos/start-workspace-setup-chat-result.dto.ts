import { Field, ObjectType } from '@nestjs/graphql';

import { AgentChatThreadDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-thread.dto';
import { WorkspaceSetupChatOutcome } from 'src/engine/metadata-modules/ai/ai-chat/enums/workspace-setup-chat-outcome.enum';

@ObjectType('StartWorkspaceSetupChatResult')
export class StartWorkspaceSetupChatResultDTO {
  @Field(() => WorkspaceSetupChatOutcome)
  outcome: WorkspaceSetupChatOutcome;

  @Field(() => AgentChatThreadDTO, { nullable: true })
  thread: AgentChatThreadDTO | null;
}
