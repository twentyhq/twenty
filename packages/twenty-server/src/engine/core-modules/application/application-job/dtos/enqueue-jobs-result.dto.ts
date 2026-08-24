import { Field, Int, ObjectType } from '@nestjs/graphql';

import { type EnqueueJobsResult } from 'twenty-shared/application';

@ObjectType('EnqueueJobsResult')
export class EnqueueJobsResultDTO implements EnqueueJobsResult {
  @Field()
  enqueued: boolean;

  @Field()
  logicFunctionUniversalIdentifier: string;

  @Field(() => Int)
  enqueuedJobsCount: number;
}
