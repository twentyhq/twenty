import { Field, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

import { ImportJobStatus } from 'src/engine/core-modules/import-job/enums/import-job-status.enum';

@ObjectType('ImportJob')
export class ImportJobDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  objectNameSingular: string;

  @Field(() => String, { nullable: true })
  fileName: string | null;

  @Field(() => ImportJobStatus)
  status: ImportJobStatus;

  @Field(() => Int)
  totalRecords: number;

  @Field(() => Int)
  processedRecords: number;

  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  warningCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field(() => GraphQLJSON, { nullable: true })
  result: Record<string, unknown> | null;

  @Field(() => Date)
  createdAt: Date;
}

@ObjectType('AppendRowsResult')
export class AppendRowsResultDTO {
  @Field(() => String)
  importJobId: string;

  @Field(() => Int)
  totalRecords: number;
}

@ObjectType('ImportJobProgress')
export class ImportJobProgressDTO {
  @Field(() => String)
  importJobId: string;

  @Field(() => ImportJobStatus)
  status: ImportJobStatus;

  @Field(() => Int)
  processedRecords: number;

  @Field(() => Int)
  totalRecords: number;

  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  warningCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field(() => GraphQLJSON, { nullable: true })
  result: Record<string, unknown> | null;
}
