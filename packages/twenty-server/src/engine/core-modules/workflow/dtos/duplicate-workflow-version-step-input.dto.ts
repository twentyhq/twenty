import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DuplicateWorkflowVersionStepInput {
  @Field(() => String)
  stepId: string;

  @Field(() => String)
  workflowVersionId: string;
}
