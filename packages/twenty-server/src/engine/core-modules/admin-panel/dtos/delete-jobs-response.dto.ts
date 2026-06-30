import { Field, Int, ObjectType } from '@nestjs/graphql';

import { JobOperationResultDTO } from 'src/engine/core-modules/admin-panel/dtos/job-operation-result.dto';

@ObjectType('DeleteJobsResponse')
export class DeleteJobsResponseDTO {
  @Field(() => Int)
  deletedCount: number;

  @Field(() => [JobOperationResultDTO])
  results: JobOperationResultDTO[];
}
