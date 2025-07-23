import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkflowEdge')
export class WorkflowEdgeDTO {
  @Field(() => String)
  source: string;

  @Field(() => String)
  target: string;
}
