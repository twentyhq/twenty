import { Field, InputType } from '@nestjs/graphql';

import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AGENT_CHAT_THREAD_PARTICIPANTS_ADD_MAX_COUNT } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participants-add-max-count.constant';

@InputType('AddAgentChatThreadParticipantsInput')
export class AddAgentChatThreadParticipantsInputDTO {
  @IsUUID()
  @Field(() => UUIDScalarType)
  threadId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(AGENT_CHAT_THREAD_PARTICIPANTS_ADD_MAX_COUNT)
  @IsUUID(undefined, { each: true })
  @Field(() => [UUIDScalarType])
  workspaceMemberIds: string[];
}
