import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RunWorkflowVersion')
export class RunWorkflowVersionDTO {
  @Field(() => UUIDScalarType)
  workflowRunId: string;
}
