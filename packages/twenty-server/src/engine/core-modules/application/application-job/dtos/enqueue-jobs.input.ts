import { Field, InputType, Int } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { type EnqueueJobsInput } from 'twenty-shared/application';

import {
  ENQUEUE_JOB_MAX_DELAY_MS,
  ENQUEUE_JOB_MAX_RETRY_LIMIT,
  ENQUEUE_JOB_MIN_DELAY_MS,
  ENQUEUE_JOB_MIN_RETRY_LIMIT,
  MAX_JOBS_PER_ENQUEUE,
} from 'src/engine/core-modules/application/application-job/constants/enqueue-job.constant';
import { EnqueueJobItemInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job-item.input';

@InputType('EnqueueJobsInput')
export class EnqueueJobsInputDTO implements EnqueueJobsInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  logicFunctionUniversalIdentifier: string;

  @IsObject({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_JOBS_PER_ENQUEUE)
  @IsOptional()
  @Field(() => [GraphQLJSON], { nullable: true })
  payloads?: Record<string, unknown>[];

  @ValidateNested({ each: true })
  @Type(() => EnqueueJobItemInputDTO)
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_JOBS_PER_ENQUEUE)
  @IsOptional()
  @Field(() => [EnqueueJobItemInputDTO], { nullable: true })
  jobs?: EnqueueJobItemInputDTO[];

  @IsInt()
  @Min(ENQUEUE_JOB_MIN_RETRY_LIMIT)
  @Max(ENQUEUE_JOB_MAX_RETRY_LIMIT)
  @IsOptional()
  @Field(() => Int, { nullable: true })
  retryLimit?: number;

  @IsInt()
  @Min(ENQUEUE_JOB_MIN_DELAY_MS)
  @Max(ENQUEUE_JOB_MAX_DELAY_MS)
  @IsOptional()
  @Field(() => Int, { nullable: true })
  delayMs?: number;
}
