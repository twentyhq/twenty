import { Field, InputType } from '@nestjs/graphql';

import { IsObject, IsOptional, Length, Matches } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { type EnqueueJobItem } from 'twenty-shared/application';

import { ENQUEUE_JOB_ID_MAX_LENGTH } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-id-max-length.constant';
import { ENQUEUE_JOB_ID_MIN_LENGTH } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-id-min-length.constant';
import { ENQUEUE_JOB_ID_PATTERN } from 'src/engine/core-modules/application/application-job/constants/enqueue-job-id-pattern.constant';

@InputType('EnqueueJobItemInput')
export class EnqueueJobItemInputDTO implements EnqueueJobItem {
  @IsObject()
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  payload?: Record<string, unknown>;

  @Matches(ENQUEUE_JOB_ID_PATTERN)
  @Length(ENQUEUE_JOB_ID_MIN_LENGTH, ENQUEUE_JOB_ID_MAX_LENGTH)
  @IsOptional()
  @Field(() => String, { nullable: true })
  jobId?: string;
}
