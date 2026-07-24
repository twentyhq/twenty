import { Field, ObjectType } from '@nestjs/graphql';

import graphqlTypeJson from 'graphql-type-json';

import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@ObjectType('WorkflowVersionTrigger')
export class WorkflowVersionTriggerDTO {
  @Field(() => graphqlTypeJson, { nullable: true })
  trigger: WorkflowTrigger | null;
}
