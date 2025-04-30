import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

@InputType()
export class UpdateBillingPlansInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  planId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  planPrice?: number;
}
