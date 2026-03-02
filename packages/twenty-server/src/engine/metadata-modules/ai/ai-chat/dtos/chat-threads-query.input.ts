import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsOptional, Max, Min } from 'class-validator';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

@InputType()
export class ChatThreadsQueryInput {
  @Field(() => Int, { nullable: true, defaultValue: DEFAULT_PAGE_SIZE })
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  @IsOptional()
  first?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  after?: string;
}
