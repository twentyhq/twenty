import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AdminChatMessagePart')
export class AdminChatMessagePartDTO {
  @Field(() => String)
  type: string;

  @Field(() => String, { nullable: true })
  textContent: string | null;

  @Field(() => String, { nullable: true })
  toolName: string | null;
}
