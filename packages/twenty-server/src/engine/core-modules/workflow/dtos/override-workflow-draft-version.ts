import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OverrideWorkflowDraftVersionInput {
  @Field(() => String, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionId: string;

  @Field(() => String, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionIdToCopy: string;
}
