import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

import { AgentDTO } from './agent.dto';

@ObjectType()
export class AgentHandoffDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => AgentDTO)
  toAgent: AgentDTO;
}
