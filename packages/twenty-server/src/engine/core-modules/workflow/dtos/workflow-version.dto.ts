import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('WorkflowVersion')
export class WorkflowVersionDTO {
  @Field(() => UUIDScalarType)
  id: string;
}
