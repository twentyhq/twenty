import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { ChatStreamErrorDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/chat-stream-error.dto';

@ObjectType('ChatStreamCatchupChunks')
export class ChatStreamCatchupChunksDTO {
  @Field(() => [GraphQLJSON])
  chunks: Record<string, unknown>[];

  @Field(() => Int)
  maxSeq: number;

  @Field(() => ChatStreamErrorDTO, { nullable: true })
  error: ChatStreamErrorDTO | null;
}
