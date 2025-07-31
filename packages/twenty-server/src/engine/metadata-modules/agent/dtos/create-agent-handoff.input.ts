import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateAgentHandoffInput {
  @Field()
  fromAgentId: string;

  @Field()
  toAgentId: string;

  @Field({ nullable: true })
  description?: string;
}
