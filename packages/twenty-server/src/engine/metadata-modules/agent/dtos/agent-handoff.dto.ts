import { Field, ObjectType } from '@nestjs/graphql';

import { AgentDTO } from './agent.dto';

@ObjectType()
export class AgentHandoffDTO {
  @Field()
  id: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => AgentDTO)
  toAgent: AgentDTO;
} 