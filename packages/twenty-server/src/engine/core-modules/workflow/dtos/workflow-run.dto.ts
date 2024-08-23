import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('WorkflowRun')
export class WorkflowRunDTO {
  @Field(() => UUIDScalarType)
  workflowRunId: string;
}
