import { Field, InputType } from '@nestjs/graphql';

import { WorkflowStepPositionUpdateInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-update-input.dto';

@InputType()
export class UpdateDraftWorkflowVersionPositionsInput {
  @Field(() => String, {
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
