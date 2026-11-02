import { Field, ObjectType } from '@nestjs/graphql';

import { WorkflowActionType } from 'twenty-shared/workflow';

@ObjectType('GettingStartedWorkflowPreviewAction')
export class GettingStartedWorkflowPreviewActionDTO {
  @Field(() => WorkflowActionType)
  type: WorkflowActionType;

  @Field(() => String)
  title: string;
}
