import { ArgsType, Field, Int } from '@nestjs/graphql';

import { IsArray, IsInt, IsOptional, IsString, Max } from 'class-validator';

import { ObjectRecordFilterInput } from 'src/engine/core-modules/search/dtos/object-record-filter-input';

@ArgsType()
export class SearchArgs {
  @Field(() => String)
  @IsString()
  searchInput: string;

  @Field(() => Int)
  @IsInt()
  @Max(100, { message: 'Limit cannot exceed 100 items' })
  limit: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  after?: string;

  @IsArray()
  @Field(() => [String], { nullable: true })
  @IsOptional()
  includedObjectNameSingulars?: string[];

  @IsOptional()
  @Field(() => ObjectRecordFilterInput, { nullable: true })
  filter?: ObjectRecordFilterInput;

  @IsArray()
  @Field(() => [String], { nullable: true })
  @IsOptional()
  excludedObjectNameSingulars?: string[];
}
