import { Field, ObjectType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-step.dto';

@ObjectType('WorkflowVersionStepChanges')
export class WorkflowVersionStepChangesDTO {
  @Field(() => [String], { nullable: true })
  triggerNextStepIds?: string[];

  @Field(() => graphqlTypeJson, { nullable: true })
  stepsNextStepIds?: Record<string, string[] | undefined>;

  @Field(() => WorkflowActionDTO, { nullable: true })
  createdStep?: WorkflowActionDTO;

  @Field(() => String, { nullable: true })
  deletedStepId?: string;
}
