import { Field, ObjectType } from '@nestjs/graphql';

import { QueueJob } from 'src/engine/core-modules/admin-panel/dtos/queue-job.dto';
import { QueueRetentionConfig } from 'src/engine/core-modules/admin-panel/dtos/queue-retention-config.dto';

@ObjectType()
export class QueueJobsResponse {
  @Field(() => [QueueJob])
  jobs: QueueJob[];

  @Field(() => Number)
  count: number;

  @Field(() => Number)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => QueueRetentionConfig)
  retentionConfig: QueueRetentionConfig;
}
