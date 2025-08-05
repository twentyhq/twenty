import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DeleteWorkflowVersionStepInput {
  @Field(() => UUIDScalarType, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionId: string;

  @Field(() => String, {
    description: 'Step to delete ID',
    nullable: false,
  })
  stepId: string;
}
