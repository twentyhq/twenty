import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateDraftFromWorkflowVersionInput {
  @Field(() => String, {
    description: 'Workflow ID',
    nullable: false,
  })
  workflowId: string;

  @Field(() => String, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionIdToCopy: string;
}
