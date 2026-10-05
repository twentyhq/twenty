import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { type EnqueueJobInput } from 'twenty-shared/application';

import { ENQUEUE_JOB_ID_MAX_LENGTH } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-id-max-length.constant';
import { ENQUEUE_JOB_ID_MIN_LENGTH } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-id-min-length.constant';
import { ENQUEUE_JOB_ID_PATTERN } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-id-pattern.constant';
import { ENQUEUE_JOB_MAX_DELAY_MS } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-max-delay-ms.constant';
import { ENQUEUE_JOB_MAX_RETRY_LIMIT } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-max-retry-limit.constant';
import { ENQUEUE_JOB_MIN_DELAY_MS } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-min-delay-ms.constant';
import { ENQUEUE_JOB_MIN_RETRY_LIMIT } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-min-retry-limit.constant';

@InputType('EnqueueJobInput')
export class EnqueueJobInputDTO implements EnqueueJobInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  logicFunctionUniversalIdentifier: string;

  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  payload?: Record<string, unknown>;

  @Matches(ENQUEUE_JOB_ID_PATTERN)
  @Length(ENQUEUE_JOB_ID_MIN_LENGTH, ENQUEUE_JOB_ID_MAX_LENGTH)
  @IsOptional()
  @Field(() => String, { nullable: true })
  jobId?: string;

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
