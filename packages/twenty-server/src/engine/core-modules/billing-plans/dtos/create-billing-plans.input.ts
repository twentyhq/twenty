import { Field, ID, InputType } from '@nestjs/graphql';

import { IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateBillingPlansInput {
  @Field()
  @IsString()
  planId: string;

  @Field()
  @IsNumber()
  planPrice: number;

  @Field(() => ID)
  @IsString()
  workspaceId: string;
}
