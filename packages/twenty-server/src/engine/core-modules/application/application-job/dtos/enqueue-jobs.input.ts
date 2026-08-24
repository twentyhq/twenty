import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';
import { type EnqueueJobsInput } from 'twenty-shared/application';

import { EnqueueJobInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job.input';

@InputType('EnqueueJobsInput')
export class EnqueueJobsInputDTO implements EnqueueJobsInput {
  @ValidateNested({ each: true })
  @Type(() => EnqueueJobInputDTO)
  @ArrayMinSize(1)
  @Field(() => [EnqueueJobInputDTO])
  jobs: EnqueueJobInputDTO[];
}
