import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import { IsArray, IsOptional } from 'class-validator';

import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  DateScalarType,
  UUIDScalarType,
} from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class ObjectRecordFilterInput implements Partial<ObjectRecordFilter> {
  @Field(() => [ObjectRecordFilterInput], { nullable: true })
  @IsOptional()
  @IsArray()
  and?: ObjectRecordFilterInput[];

  @Field(() => ObjectRecordFilterInput, { nullable: true })
  @IsOptional()
  not?: ObjectRecordFilterInput;

  @Field(() => [ObjectRecordFilterInput], { nullable: true })
  @IsOptional()
  @IsArray()
  or?: ObjectRecordFilterInput[];

  @Field(() => UUIDFilterType, { nullable: true })
  @IsOptional()
  id?: UUIDFilterType | null;

  @Field(() => DateFilterType, { nullable: true })
  createdAt?: DateFilterType | null;

  @Field(() => DateFilterType, { nullable: true })
  updatedAt?: DateFilterType | null;

  @Field(() => DateFilterType, { nullable: true })
  deletedAt?: DateFilterType | null;
}

@InputType('UUIDFilter')
class UUIDFilterType {
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  eq?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  gt?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  gte?: string;

  @Field(() => [UUIDScalarType], { nullable: true })
  @IsOptional()
  in?: string[];

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  lt?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  lte?: string;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  neq?: string;

  @Field(() => FilterIs, { nullable: true })
  @IsOptional()
  is?: FilterIs;
}

@InputType('DateFilter')
class DateFilterType {
  @Field(() => DateScalarType, { nullable: true })
  @IsOptional()
  eq?: Date;

  @Field(() => DateScalarType, { nullable: true })
  @IsOptional()
  gt?: Date;

  @Field(() => DateScalarType, { nullable: true })
  @IsOptional()
  gte?: Date;

  @Field(() => [DateScalarType], { nullable: true })
  @IsOptional()
  in?: Date[];

  @Field(() => DateScalarType, { nullable: true })
  @IsOptional()
  lt?: Date;

  @Field(() => DateScalarType, { nullable: true })
  @IsOptional()
  lte?: Date;

  @Field(() => DateScalarType, { nullable: true })
  @IsOptional()
  neq?: Date;

  @Field(() => FilterIs, { nullable: true })
  @IsOptional()
  is?: FilterIs;
}

enum FilterIs {
  NotNull = 'NOT_NULL',
  Null = 'NULL',
}

registerEnumType(FilterIs, {
  name: 'FilterIs',
});
