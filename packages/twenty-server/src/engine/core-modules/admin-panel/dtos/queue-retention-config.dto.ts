import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class QueueRetentionConfig {
  @Field(() => Number)
  completedMaxAge: number;

  @Field(() => Number)
  completedMaxCount: number;

  @Field(() => Number)
  failedMaxAge: number;

  @Field(() => Number)
  failedMaxCount: number;
}
