import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, Min } from 'class-validator';
import { type EnqueueJobsLimiter } from 'twenty-shared/application';

@InputType('EnqueueJobsLimiterInput')
export class EnqueueJobsLimiterInputDTO implements EnqueueJobsLimiter {
  @IsInt()
  @Min(1)
  @Field(() => Int)
  max: number;

  @IsInt()
  @Min(1)
  @Field(() => Int)
  durationMs: number;
}
