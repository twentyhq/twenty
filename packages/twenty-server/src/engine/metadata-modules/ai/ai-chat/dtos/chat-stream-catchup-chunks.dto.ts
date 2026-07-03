import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType('ChatStreamCatchupChunks')
export class ChatStreamCatchupChunksDTO {
  @Field(() => [GraphQLJSON])
  chunks: Record<string, unknown>[];

  @Field(() => Int)
  maxSeq: number;
}
