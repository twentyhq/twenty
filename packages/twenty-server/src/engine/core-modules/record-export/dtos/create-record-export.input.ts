import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsObject,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TraversedRecordExportFieldInput } from 'src/engine/core-modules/record-export/dtos/traversed-record-export-field.input';

@InputType()
export class CreateRecordExportInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  objectMetadataId: string;

  @Field(() => [UUIDScalarType])
  @IsArray()
  @ArrayMaxSize(500)
  @ArrayUnique()
  @IsUUID(undefined, { each: true })
  fieldMetadataIds: string[];

  @Field(() => [TraversedRecordExportFieldInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => TraversedRecordExportFieldInput)
  traversedFields?: TraversedRecordExportFieldInput[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  filter?: ObjectRecordFilter;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  orderBy?: ObjectRecordOrderBy;
}
