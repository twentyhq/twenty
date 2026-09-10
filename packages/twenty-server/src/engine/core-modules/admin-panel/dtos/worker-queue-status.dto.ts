import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('WorkerQueueStatus')
export class WorkerQueueStatusDTO {
  @Field(() => String)
  queueName: string;

  @Field(() => Number)
  workers: number;

  @Field(() => Number, { nullable: true })
  waiting: number | null;

  @Field(() => Number, { nullable: true })
  active: number | null;

  @Field(() => Number, { nullable: true })
  delayed: number | null;

  @Field(() => Number, { nullable: true })
  failureRate: number | null;
}
