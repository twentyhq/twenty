import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RunWorkflowVersionOutput')
export class RunWorkflowVersionOutput {
  @Field(() => UUIDScalarType)
  workflowRunId: string;
}
