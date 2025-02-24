import { ArgsType, Field, Int } from '@nestjs/graphql';

import { IsArray, IsString } from 'class-validator';

@ArgsType()
export class GlobalSearchArgs {
  @Field(() => String)
  @IsString()
  searchInput: string;

  @Field(() => Int)
  limit: number;

  @IsArray()
  @Field(() => [String], { nullable: true })
  excludedObjectNameSingulars?: string[];
}
