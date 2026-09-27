import { Field, InputType, Int } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import {
  IsArray,
  IsBoolean,
  Max,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class RecordImportSessionInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;
}

@InputType()
export class PreviewRecordImportSheetInput extends RecordImportSessionInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sheetName?: string;
}

@InputType()
export class RecordImportVersionedInput extends RecordImportSessionInput {
  // The session version the user acted on; stale writes are rejected (LIFE-3)
  @Field(() => Int)
  @IsInt()
  @Min(1)
  version: number;
}

@InputType()
export class PrepareRecordImportInput extends RecordImportVersionedInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sheetName?: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  headerRowIndex: number;
}

@InputType()
export class SetRecordImportMappingInput extends RecordImportVersionedInput {
  // SpreadsheetColumns, validated against the header and live metadata
  @Field(() => GraphQLJSON)
  @IsArray()
  columns: unknown[];
}

@InputType()
export class RecordImportRowsInput extends RecordImportSessionInput {
  @Field(() => Int)
  @IsInt()
  @Min(0)
  offset: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(500)
  limit: number;

  @Field(() => Boolean)
  @IsBoolean()
  onlyErrors: boolean;
}
