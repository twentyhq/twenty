import { Field, Int, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType('AdminChatMessagePart')
export class AdminChatMessagePartDTO {
  @Field(() => String)
  type: string;

  @Field(() => Int)
  orderIndex: number;

  @Field(() => String, { nullable: true })
  textContent: string | null;

  @Field(() => String, { nullable: true })
  reasoningContent: string | null;

  @Field(() => String, { nullable: true })
  toolName: string | null;

  @Field(() => String, { nullable: true })
  toolCallId: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  toolInput: unknown | null;

  @Field(() => GraphQLJSON, { nullable: true })
  toolOutput: unknown | null;

  @Field(() => String, { nullable: true })
  state: string | null;

  @Field(() => String, { nullable: true })
  errorMessage: string | null;
}
