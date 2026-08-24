import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ValidateNested } from 'class-validator';
import { type EnqueueJobsInput } from 'twenty-shared/application';

import { ENQUEUE_JOBS_MAX_BATCH_SIZE } from 'src/engine/core-modules/application/application-job/constants/enqueue-job.constant';
import { EnqueueJobInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job.input';

@InputType('EnqueueJobsInput')
export class EnqueueJobsInputDTO implements EnqueueJobsInput {
  @ValidateNested({ each: true })
  @Type(() => EnqueueJobInputDTO)
  @ArrayMinSize(1)
  @ArrayMaxSize(ENQUEUE_JOBS_MAX_BATCH_SIZE)
  @Field(() => [EnqueueJobInputDTO])
  jobs: EnqueueJobInputDTO[];
}
