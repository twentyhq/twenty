import { Field, ObjectType } from '@nestjs/graphql';

import { QueueJobDTO } from 'src/engine/core-modules/admin-panel/dtos/queue-job.dto';
import { QueueRetentionConfigDTO } from 'src/engine/core-modules/admin-panel/dtos/queue-retention-config.dto';

@ObjectType('QueueJobsResponse')
export class QueueJobsResponseDTO {
  @Field(() => [QueueJobDTO])
  jobs: QueueJobDTO[];

  @Field(() => Number)
  count: number;

  @Field(() => Number)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => QueueRetentionConfigDTO)
  retentionConfig: QueueRetentionConfigDTO;
}
