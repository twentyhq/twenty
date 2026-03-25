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
  failureRate: number;

  @Field(() => [Number], { nullable: true })
  failedData?: number[];

  @Field(() => [Number], { nullable: true })
  completedData?: number[];
}
