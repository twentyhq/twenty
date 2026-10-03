import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('AdminChatTurnContext')
export class AdminChatTurnContextDTO {
  @Field(() => String)
  context: string;

  @Field(() => Date)
  createdAt: Date;
}
