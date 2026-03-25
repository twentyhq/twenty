import { Field, Int, ObjectType } from '@nestjs/graphql';

import { JobOperationResultDTO } from 'src/engine/core-modules/admin-panel/dtos/job-operation-result.dto';

@ObjectType('RetryJobsResponse')
export class RetryJobsResponseDTO {
  @Field(() => Int)
  retriedCount: number;

  @Field(() => [JobOperationResultDTO])
  results: JobOperationResultDTO[];
}
