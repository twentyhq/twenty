import { Field, InputType, Int } from '@nestjs/graphql';

import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { type EnqueueJobInput } from 'twenty-shared/application';

import {
  ENQUEUE_JOB_MAX_DELAY_MS,
  ENQUEUE_JOB_MAX_PRIORITY,
  ENQUEUE_JOB_MAX_RETRY_LIMIT,
  ENQUEUE_JOB_MIN_DELAY_MS,
  ENQUEUE_JOB_MIN_PRIORITY,
  ENQUEUE_JOB_MIN_RETRY_LIMIT,
} from 'src/engine/core-modules/application/application-job/constants/enqueue-job.constant';

@InputType('EnqueueJobInput')
export class EnqueueJobInputDTO implements EnqueueJobInput {
  @IsUUID()
  @IsNotEmpty()
  @Field()
  logicFunctionUniversalIdentifier: string;

  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  payload?: object;

  @IsInt()
  @Min(ENQUEUE_JOB_MIN_RETRY_LIMIT)
  @Max(ENQUEUE_JOB_MAX_RETRY_LIMIT)
  @IsOptional()
  @Field(() => Int, { nullable: true })
  retryLimit?: number;

  @IsInt()
  @Min(ENQUEUE_JOB_MIN_PRIORITY)
  @Max(ENQUEUE_JOB_MAX_PRIORITY)
  @IsOptional()
  @Field(() => Int, { nullable: true })
  priority?: number;

  @IsInt()
  @Min(ENQUEUE_JOB_MIN_DELAY_MS)
  @Max(ENQUEUE_JOB_MAX_DELAY_MS)
  @IsOptional()
  @Field(() => Int, { nullable: true })
  delayMs?: number;
}
