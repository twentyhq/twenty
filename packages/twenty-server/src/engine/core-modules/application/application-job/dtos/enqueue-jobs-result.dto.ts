import { Field, ObjectType } from '@nestjs/graphql';

import { type EnqueueJobsResult } from 'twenty-shared/application';

import { EnqueueJobResultDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job-result.dto';

@ObjectType('EnqueueJobsResult')
export class EnqueueJobsResultDTO implements EnqueueJobsResult {
  @Field(() => [EnqueueJobResultDTO])
  jobs: EnqueueJobResultDTO[];
}
