import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkflowStepPosition {
  @Field(() => Number)
  x: number;

  @Field(() => Number)
  y: number;
}
