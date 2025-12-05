import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class AgentIdInput {
  @Field(() => UUIDScalarType, { description: 'The id of the agent.' })
  id!: string;
}
