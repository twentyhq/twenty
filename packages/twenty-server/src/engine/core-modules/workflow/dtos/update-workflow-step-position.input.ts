import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class WorkflowStepPositionInput {
  @Field(() => Number)
  x: number;

  @Field(() => Number)
  y: number;
}
