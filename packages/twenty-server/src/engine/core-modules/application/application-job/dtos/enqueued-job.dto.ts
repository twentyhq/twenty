import { Field, Int, ObjectType } from '@nestjs/graphql';

import { type EnqueuedJob } from 'twenty-shared/application';

@ObjectType('EnqueuedJob')
export class EnqueuedJobDTO implements EnqueuedJob {
  @Field()
  jobId: string;

  @Field(() => Int)
  sizeBytes: number;
}
