import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

import { type EnqueueJobsResult } from 'twenty-shared/application';

import { EnqueuedJobDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueued-job.dto';

@ObjectType('EnqueueJobsResult')
export class EnqueueJobsResultDTO implements EnqueueJobsResult {
  @Field()
  enqueued: boolean;

  @Field()
  logicFunctionUniversalIdentifier: string;

  @Field(() => Int)
  enqueuedJobsCount: number;

  @Field(() => [String])
  jobIds: string[];

  @Field(() => [EnqueuedJobDTO])
  jobs: EnqueuedJobDTO[];

  @Field(() => Float, { nullable: true })
  availableBytes: number | null;
}
