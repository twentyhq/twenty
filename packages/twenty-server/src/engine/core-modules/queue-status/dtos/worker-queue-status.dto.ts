import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WorkerQueueStatusDTO {
  @Field(() => String)
  queueName: string;

  @Field(() => Number)
  workers: number;

  @Field(() => Number)
  waiting: number;

  @Field(() => Number)
  active: number;

  @Field(() => Number)
  delayed: number;

  @Field(() => Number)
  failureRate: number;
}
