import { Field, InputType, Int } from '@nestjs/graphql';

import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class UpdatePageLayoutTabInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}
