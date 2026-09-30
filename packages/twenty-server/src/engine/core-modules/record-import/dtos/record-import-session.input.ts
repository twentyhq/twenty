import { Field, InputType, Int } from '@nestjs/graphql';

import { Type } from 'class-transformer';

import GraphQLJSON from 'graphql-type-json';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsObject,
  ValidateNested,
  Max,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

import { RECORD_IMPORT_MAX_EDITS_PER_REQUEST } from 'src/engine/core-modules/record-import/constants/record-import.constants';
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
  // The session version the user acted on; stale writes are rejected
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

@InputType()
export class RecordImportRowEditInput {
  // Original spreadsheet row number, as the review grid shows it
  @Field(() => Int)
  @IsInt()
  @Min(1)
  rowNumber: number;

  // New values by field key; each is checked against the mapping
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  values?: Record<string, string | boolean | null>;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

@InputType()
export class EditRecordImportRowsInput extends RecordImportVersionedInput {
  @Field(() => [RecordImportRowEditInput])
  @IsArray()
  @ArrayMaxSize(RECORD_IMPORT_MAX_EDITS_PER_REQUEST)
  @ValidateNested({ each: true })
  @Type(() => RecordImportRowEditInput)
  edits: RecordImportRowEditInput[];
}
