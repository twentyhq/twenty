import { Field, Int, ObjectType } from '@nestjs/graphql';

import { JobStateEnum } from 'src/engine/core-modules/message-queue/enums/job-state.enum';

@ObjectType('JobStatus')
export class JobStatusDTO {
  @Field()
  jobId: string;

  @Field(() => JobStateEnum)
  state: JobStateEnum;

  @Field(() => Int)
  attemptsMade: number;

  @Field(() => String, { nullable: true })
  failedReason?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Completion percentage reported by the job, from 0 to 100',
  })
  progress?: number;

  @Field(() => Number)
  enqueuedAt: number;

  @Field(() => Number, { nullable: true })
  startedAt?: number;

  @Field(() => Number, { nullable: true })
  finishedAt?: number;
}
