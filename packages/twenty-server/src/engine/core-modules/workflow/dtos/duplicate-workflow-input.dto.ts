import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class DuplicateWorkflowInput {
  @Field(() => UUIDScalarType, {
    description: 'Workflow ID to duplicate',
    nullable: false,
  })
  workflowIdToDuplicate: string;

  @Field(() => UUIDScalarType, {
    description: 'Workflow version ID to copy',
    nullable: false,
  })
  workflowVersionIdToCopy: string;
}
