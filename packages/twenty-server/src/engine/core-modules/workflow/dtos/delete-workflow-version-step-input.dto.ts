import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteWorkflowVersionStepInput {
  @Field(() => String, {
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
