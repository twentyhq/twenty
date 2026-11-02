import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('GettingStartedWorkflow')
export class GettingStartedWorkflowDTO {
  @Field(() => String)
  workflowId: string;

  @Field(() => String)
  versionId: string;
}
