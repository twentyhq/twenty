import { Field, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

import { ExportJobStatus } from 'src/engine/core-modules/export-job/enums/export-job-status.enum';

@ObjectType('ExportJob')
export class ExportJobDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  objectNameSingular: string;

  @Field(() => String)
  format: string;

  @Field(() => ExportJobStatus)
  status: ExportJobStatus;

  @Field(() => Int)
  totalRecords: number;

  @Field(() => Int)
  processedRecords: number;

  @Field(() => GraphQLJSON, { nullable: true })
  result: Record<string, unknown> | null;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType('ExportJobProgress')
export class ExportJobProgressDTO {
  @Field(() => String)
  exportJobId: string;

  @Field(() => ExportJobStatus)
  status: ExportJobStatus;

  @Field(() => Int)
  processedRecords: number;

  @Field(() => Int)
  totalRecords: number;

  @Field(() => GraphQLJSON, { nullable: true })
  result: Record<string, unknown> | null;
}
