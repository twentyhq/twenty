import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkflowStepPosition')
export class WorkflowStepPosition {
  @Field(() => Number)
  x: number;

  @Field(() => Number)
  y: number;
}
