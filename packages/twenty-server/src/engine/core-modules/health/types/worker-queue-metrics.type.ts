import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkerQueueMetrics {
  @Field(() => Number)
  failed: number;

  @Field(() => Number)
  completed: number;

  @Field(() => Number)
  waiting: number;

  @Field(() => Number)
  active: number;

  @Field(() => Number)
  delayed: number;

  @Field(() => Number)
  prioritized: number;
}
