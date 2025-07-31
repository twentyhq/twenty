import { Field, InputType } from '@nestjs/graphql';

import { WorkflowStepPositionUpdateInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-update-input.dto';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpdateWorkflowVersionPositionsInput {
  @Field(() => UUIDScalarType, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionId: string;

  @Field(() => [WorkflowStepPositionUpdateInput], {
    description: 'Workflow version updated positions',
    nullable: false,
  })
  positions: WorkflowStepPositionUpdateInput[];
}
