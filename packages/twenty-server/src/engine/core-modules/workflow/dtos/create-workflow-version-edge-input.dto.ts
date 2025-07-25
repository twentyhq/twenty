import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class WorkflowVersionEdgeInput {
  @Field(() => String, {
    description: 'Workflow version ID',
    nullable: false,
  })
  workflowVersionId: string;

  @Field(() => String, {
    description: 'Workflow version source step ID',
    nullable: false,
  })
  source: string;

  @Field(() => String, {
    description: 'Workflow version target step ID',
    nullable: false,
  })
  target: string;
}
