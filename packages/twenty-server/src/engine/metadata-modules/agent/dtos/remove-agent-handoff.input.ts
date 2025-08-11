import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class RemoveAgentHandoffInput {
  @Field(() => UUIDScalarType)
  fromAgentId: string;

  @Field(() => UUIDScalarType)
  toAgentId: string;
}
