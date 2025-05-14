import { ArgsType, Field, Int } from '@nestjs/graphql';

import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

import { ObjectRecordFilterInput } from 'src/engine/core-modules/search/dtos/object-record-filter-input';

@ArgsType()
export class SearchArgs {
  @Field(() => String)
  @IsString()
  searchInput: string;

  @Field(() => Int)
  @IsInt()
  limit: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  offset?: number;

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
