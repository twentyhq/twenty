import { Field, Float, InputType } from '@nestjs/graphql';

import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdatePageLayoutTabInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  position?: number;
}
