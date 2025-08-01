import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateDraftFromWorkflowVersionInput {
  @Field(() => UUIDScalarType, {
    description: 'Workflow ID',
    nullable: false,
  })
  workflowId: string;

  @Field(() => UUIDScalarType, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionIdToCopy: string;
}
