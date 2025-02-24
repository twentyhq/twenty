import { ArgsType, Field, Int } from '@nestjs/graphql';

import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class GlobalSearchArgs {
  @Field(() => String)
  @IsString()
  searchInput: string;

  @Field(() => Int)
  @IsInt()
  limit: number;

  @IsArray()
  @Field(() => [String], { nullable: true })
  @IsOptional()
  excludedObjectNameSingulars?: string[];
}
