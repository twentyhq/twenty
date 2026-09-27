import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('RecordImport')
export class RecordImportDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => Int)
  version: number;

  @Field(() => String)
  status: string;

  @Field(() => String)
  fileName: string;

  @Field(() => [String])
  sheetNames: string[];

  @Field(() => String, { nullable: true })
  sheetName: string | null;

  @Field(() => Int, { nullable: true })
  rowCount: number | null;

  @Field(() => Boolean)
  isMapped: boolean;

  @Field(() => Int)
  progress: number;

  @Field(() => Int)
  processedRowCount: number;

  @Field(() => Int)
  totalRowCount: number;

  @Field(() => Int)
  importedRecordCount: number;

  @Field(() => Int)
  skippedRowCount: number;

  @Field(() => Int)
  failedRowCount: number;

  // Rows with at least one blocking error, once validated
  @Field(() => Int, { nullable: true })
  errorRowCount: number | null;

  @Field(() => Boolean)
  hasReport: boolean;

  @Field(() => String, { nullable: true })
  errorMessage: string | null;
}
