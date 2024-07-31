import { Field, ObjectType } from '@nestjs/graphql';

import { IsObject } from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@ObjectType('WorkflowTriggerResult')
export class WorkflowTriggerResultDTO {
  @IsObject()
  @Field(() => graphqlTypeJson, {
    description: 'Execution result in JSON format',
    nullable: true,
  })
  result?: JSON;
}
