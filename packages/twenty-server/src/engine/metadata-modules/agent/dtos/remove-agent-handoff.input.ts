import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveAgentHandoffInput {
  @Field()
  fromAgentId: string;

  @Field()
  toAgentId: string;
}
