import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class AgentIdInput {
  @Field(() => ID, { description: 'The id of the agent.' })
  id!: string;
}
