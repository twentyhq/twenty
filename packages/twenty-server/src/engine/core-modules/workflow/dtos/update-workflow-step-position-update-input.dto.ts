import { Field, InputType } from '@nestjs/graphql';

import { WorkflowStepPositionInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-input.dto';

@InputType()
export class WorkflowStepPositionUpdateInput {
  @Field(() => String, {
    description: 'Step or trigger ID',
    nullable: false,
  })
  id: string;

  @Field(() => WorkflowStepPositionInput, {
    description: 'Position of the step or trigger',
    nullable: false,
  })
  position: WorkflowStepPositionInput;
}
