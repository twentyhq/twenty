import { Field, ObjectType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-step.dto';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@ObjectType('WorkflowVersionStepUpdates')
export class WorkflowVersionStepUpdatesDTO {
  @Field(() => [String], { nullable: true })
  triggerNextStepIds?: string[];

  @Field(() => graphqlTypeJson, { nullable: true })
  stepsNextStepIds?: Record<string, string[] | undefined>;

  @Field(() => WorkflowActionDTO, { nullable: true })
  createdStep?: WorkflowAction;

  @Field(() => String, { nullable: true })
  deletedStepId?: string;
}
