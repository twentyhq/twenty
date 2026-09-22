import { Field, InputType, Int } from '@nestjs/graphql';

import { IsOptional, IsString, Max, Min } from 'class-validator';

@InputType()
export class FindMessageTrackingOptOutsInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @Field(() => Int, { defaultValue: 30 })
  @Min(1)
  @Max(100)
  limit: number;

  @Field(() => Int, { defaultValue: 0 })
  @Min(0)
  offset: number;
}
