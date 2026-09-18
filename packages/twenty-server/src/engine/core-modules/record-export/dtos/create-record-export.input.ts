import { Field, InputType } from '@nestjs/graphql';

import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsObject,
  IsOptional,
  IsUUID,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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
