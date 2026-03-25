import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { Difference } from 'microdiff';

@ObjectType('WorkflowVersionStepChanges')
export class WorkflowVersionStepChangesDTO {
  @Field(() => GraphQLJSON, { nullable: true })
  triggerDiff?: Difference[];

  @Field(() => GraphQLJSON, { nullable: true })
  stepsDiff?: Difference[];
}
